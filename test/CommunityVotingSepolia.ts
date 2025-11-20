import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { CommunityVoting } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

describe("CommunityVotingSepolia", function () {
  let signers: Signers;
  let communityVotingContract: CommunityVoting;
  let communityVotingContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const CommunityVotingDeployment = await deployments.get("CommunityVoting");
      communityVotingContractAddress = CommunityVotingDeployment.address;
      communityVotingContract = await ethers.getContractAt("CommunityVoting", CommunityVotingDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { 
      alice: ethSigners[0], 
      bob: ethSigners[1],
      charlie: ethSigners[2]
    };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should allow multiple users to vote for different candidates", async function () {
    steps = 15;

    this.timeout(4 * 40000);

    // Alice votes for candidate 1
    progress("Alice encrypting vote for candidate 1...");
    const encryptedCandidate1 = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.alice.address)
      .add32(0)
      .encrypt();

    progress(`Alice voting for candidate 1...`);
    let tx = await communityVotingContract
      .connect(signers.alice)
      .vote(encryptedCandidate1.handles[0], encryptedCandidate1.inputProof);
    await tx.wait();

    progress("Bob encrypting vote for candidate 2...");
    const encryptedCandidate2 = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.bob.address)
      .add32(1)
      .encrypt();

    progress(`Bob voting for candidate 2...`);
    tx = await communityVotingContract
      .connect(signers.bob)
      .vote(encryptedCandidate2.handles[0], encryptedCandidate2.inputProof);
    await tx.wait();

    progress("Charlie encrypting vote for candidate 3...");
    const encryptedCandidate3 = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.charlie.address)
      .add32(2)
      .encrypt();

    progress(`Charlie voting for candidate 3...`);
    tx = await communityVotingContract
      .connect(signers.charlie)
      .vote(encryptedCandidate3.handles[0], encryptedCandidate3.inputProof);
    await tx.wait();

    progress("Getting vote counts...");
    const encryptedCounts = await communityVotingContract.getVoteCounts();

    progress("Decrypting candidate 1 votes...");
    const candidate1Count = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[0],
      communityVotingContractAddress,
      signers.alice,
    );
    progress(`Candidate 1 votes: ${candidate1Count}`);

    progress("Decrypting candidate 2 votes...");
    const candidate2Count = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[1],
      communityVotingContractAddress,
      signers.alice,
    );
    progress(`Candidate 2 votes: ${candidate2Count}`);

    progress("Decrypting candidate 3 votes...");
    const candidate3Count = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[2],
      communityVotingContractAddress,
      signers.alice,
    );
    progress(`Candidate 3 votes: ${candidate3Count}`);

    progress("Decrypting total votes...");
    const totalCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[4],
      communityVotingContractAddress,
      signers.alice,
    );
    progress(`Total votes: ${totalCount}`);

    expect(candidate1Count).to.eq(1);
    expect(candidate2Count).to.eq(1);
    expect(candidate3Count).to.eq(1);
    expect(totalCount).to.eq(3);
  });

  it("should authorize user for decryption on Sepolia", async function () {
    steps = 8;
    this.timeout(3 * 40000);

    // Alice votes first
    progress("Alice encrypting vote...");
    const encryptedCandidate = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.alice.address)
      .add32(0)
      .encrypt();

    progress("Alice voting...");
    let tx = await communityVotingContract
      .connect(signers.alice)
      .vote(encryptedCandidate.handles[0], encryptedCandidate.inputProof);
    await tx.wait();

    progress("Authorizing Bob for decryption...");
    tx = await communityVotingContract
      .connect(signers.alice)
      .authorizeUserForDecryption(signers.bob.address);
    await tx.wait();

    progress("Getting encrypted vote counts...");
    const encryptedCounts = await communityVotingContract.getVoteCounts();

    progress("Bob decrypting vote counts...");
    const candidate1Count = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[0],
      communityVotingContractAddress,
      signers.bob,
    );

    const totalCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[4],
      communityVotingContractAddress,
      signers.bob,
    );

    progress(`Decrypted results: Candidate 1=${candidate1Count}, Total=${totalCount}`);

    expect(candidate1Count).to.eq(1);
    expect(totalCount).to.eq(1);
  });

  it("should prevent double voting on Sepolia", async function () {
    steps = 6;
    this.timeout(3 * 40000);

    // Alice votes once
    progress("Alice encrypting first vote...");
    const encryptedCandidate1 = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.alice.address)
      .add32(0)
      .encrypt();

    progress("Alice voting first time...");
    let tx = await communityVotingContract
      .connect(signers.alice)
      .vote(encryptedCandidate1.handles[0], encryptedCandidate1.inputProof);
    await tx.wait();

    // Alice tries to vote again - should fail
    progress("Alice encrypting second vote...");
    const encryptedCandidate2 = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.alice.address)
      .add32(1)
      .encrypt();

    progress("Alice attempting second vote (should fail)...");
    await expect(
      communityVotingContract
        .connect(signers.alice)
        .vote(encryptedCandidate2.handles[0], encryptedCandidate2.inputProof)
    ).to.be.revertedWith("CommunityVoting: already voted");

    progress("Double voting correctly prevented");
  });

  it("should handle large number of votes on Sepolia", async function () {
    steps = 12;
    this.timeout(8 * 40000);

    // Simulate multiple votes with different accounts
    const voters = [signers.alice, signers.bob, signers.charlie];
    const candidates = [0, 1, 2, 0, 1, 2]; // Pattern of votes

    for (let i = 0; i < candidates.length; i++) {
      const voter = voters[i % voters.length];
      const candidateId = candidates[i];

      progress(`Voter ${i + 1} encrypting vote for candidate ${candidateId}...`);
      const encryptedCandidate = await fhevm
        .createEncryptedInput(communityVotingContractAddress, voter.address)
        .add32(candidateId)
        .encrypt();

      progress(`Voter ${i + 1} voting...`);
      const tx = await communityVotingContract
        .connect(voter)
        .vote(encryptedCandidate.handles[0], encryptedCandidate.inputProof);
      await tx.wait();
    }

    progress("Authorizing Alice for decryption...");
    let tx = await communityVotingContract
      .connect(signers.alice)
      .authorizeUserForDecryption(signers.alice.address);
    await tx.wait();

    progress("Getting final vote counts...");
    const encryptedCounts = await communityVotingContract.getVoteCounts();

    progress("Decrypting results...");
    const results = await Promise.all([
      fhevm.userDecryptEuint(FhevmType.euint32, encryptedCounts[0], communityVotingContractAddress, signers.alice),
      fhevm.userDecryptEuint(FhevmType.euint32, encryptedCounts[1], communityVotingContractAddress, signers.alice),
      fhevm.userDecryptEuint(FhevmType.euint32, encryptedCounts[2], communityVotingContractAddress, signers.alice),
      fhevm.userDecryptEuint(FhevmType.euint32, encryptedCounts[3], communityVotingContractAddress, signers.alice),
      fhevm.userDecryptEuint(FhevmType.euint32, encryptedCounts[4], communityVotingContractAddress, signers.alice),
    ]);

    const [candidate1, candidate2, candidate3, candidate4, total] = results;

    progress(`Final results: C1=${candidate1}, C2=${candidate2}, C3=${candidate3}, C4=${candidate4}, Total=${total}`);

    expect(candidate1).to.eq(2); // candidates[0] and candidates[3]
    expect(candidate2).to.eq(2); // candidates[1] and candidates[4]
    expect(candidate3).to.eq(2); // candidates[2] and candidates[5]
    expect(candidate4).to.eq(0);
    expect(total).to.eq(6);
  });
});

