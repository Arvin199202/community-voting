import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { CommunityVoting, CommunityVoting__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
  dave: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("CommunityVoting")) as CommunityVoting__factory;
  const communityVotingContract = (await factory.deploy()) as CommunityVoting;
  const communityVotingContractAddress = await communityVotingContract.getAddress();

  return { communityVotingContract, communityVotingContractAddress };
}

describe("CommunityVoting", function () {
  let signers: Signers;
  let communityVotingContract: CommunityVoting;
  let communityVotingContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { 
      deployer: ethSigners[0], 
      alice: ethSigners[1], 
      bob: ethSigners[2],
      charlie: ethSigners[3],
      dave: ethSigners[4]
    };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ communityVotingContract, communityVotingContractAddress } = await deployFixture());
  });

  it("should initialize with zero votes for all candidates", async function () {
    const encryptedCounts = await communityVotingContract.getVoteCounts();
    
    // Decrypt each candidate's vote count (should all be 0)
    const candidate1Count = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[0],
      communityVotingContractAddress,
      signers.alice,
    );
    const candidate2Count = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[1],
      communityVotingContractAddress,
      signers.alice,
    );
    const candidate3Count = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[2],
      communityVotingContractAddress,
      signers.alice,
    );
    const candidate4Count = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[3],
      communityVotingContractAddress,
      signers.alice,
    );
    const totalCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[4],
      communityVotingContractAddress,
      signers.alice,
    );

    expect(candidate1Count).to.eq(0);
    expect(candidate2Count).to.eq(0);
    expect(candidate3Count).to.eq(0);
    expect(candidate4Count).to.eq(0);
    expect(totalCount).to.eq(0);
  });

  it("should allow alice to vote for candidate 1", async function () {
    const candidateId = 0; // Candidate 1
    
    // Encrypt candidate ID
    const encryptedCandidate = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.alice.address)
      .add32(candidateId)
      .encrypt();

    // Alice votes for candidate 1
    const tx = await communityVotingContract
      .connect(signers.alice)
      .vote(encryptedCandidate.handles[0], encryptedCandidate.inputProof);
    await tx.wait();

    // Check that alice has voted
    expect(await communityVotingContract.checkHasVoted(signers.alice.address)).to.eq(true);

    // Decrypt and verify vote counts
    const encryptedCounts = await communityVotingContract.getVoteCounts();
    const candidate1Count = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[0],
      communityVotingContractAddress,
      signers.alice,
    );
    const totalCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[4],
      communityVotingContractAddress,
      signers.alice,
    );

    expect(candidate1Count).to.eq(1);
    expect(totalCount).to.eq(1);
  });

  it("should allow multiple users to vote for different candidates", async function () {
    // Alice votes for candidate 1
    const encryptedCandidate1 = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.alice.address)
      .add32(0)
      .encrypt();
    await communityVotingContract
      .connect(signers.alice)
      .vote(encryptedCandidate1.handles[0], encryptedCandidate1.inputProof);

    // Bob votes for candidate 2
    const encryptedCandidate2 = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.bob.address)
      .add32(1)
      .encrypt();
    await communityVotingContract
      .connect(signers.bob)
      .vote(encryptedCandidate2.handles[0], encryptedCandidate2.inputProof);

    // Charlie votes for candidate 3
    const encryptedCandidate3 = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.charlie.address)
      .add32(2)
      .encrypt();
    await communityVotingContract
      .connect(signers.charlie)
      .vote(encryptedCandidate3.handles[0], encryptedCandidate3.inputProof);

    // Dave votes for candidate 4
    const encryptedCandidate4 = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.dave.address)
      .add32(3)
      .encrypt();
    await communityVotingContract
      .connect(signers.dave)
      .vote(encryptedCandidate4.handles[0], encryptedCandidate4.inputProof);

    // Decrypt and verify vote counts
    const encryptedCounts = await communityVotingContract.getVoteCounts();
    const candidate1Count = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[0],
      communityVotingContractAddress,
      signers.alice,
    );
    const candidate2Count = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[1],
      communityVotingContractAddress,
      signers.alice,
    );
    const candidate3Count = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[2],
      communityVotingContractAddress,
      signers.alice,
    );
    const candidate4Count = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[3],
      communityVotingContractAddress,
      signers.alice,
    );
    const totalCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[4],
      communityVotingContractAddress,
      signers.alice,
    );

    expect(candidate1Count).to.eq(1);
    expect(candidate2Count).to.eq(1);
    expect(candidate3Count).to.eq(1);
    expect(candidate4Count).to.eq(1);
    expect(totalCount).to.eq(4);
  });

  it("should prevent a user from voting twice", async function () {
    const candidateId = 0;
    
    const encryptedCandidate = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.alice.address)
      .add32(candidateId)
      .encrypt();

    // First vote should succeed
    await communityVotingContract
      .connect(signers.alice)
      .vote(encryptedCandidate.handles[0], encryptedCandidate.inputProof);

    // Second vote should fail
    const encryptedCandidate2 = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.alice.address)
      .add32(1)
      .encrypt();

    await expect(
      communityVotingContract
        .connect(signers.alice)
        .vote(encryptedCandidate2.handles[0], encryptedCandidate2.inputProof)
    ).to.be.revertedWith("CommunityVoting: already voted");
  });

  it("should allow users to view their own encrypted vote", async function () {
    const candidateId = 2; // Candidate 3
    
    const encryptedCandidate = await fhevm
      .createEncryptedInput(communityVotingContractAddress, signers.alice.address)
      .add32(candidateId)
      .encrypt();

    await communityVotingContract
      .connect(signers.alice)
      .vote(encryptedCandidate.handles[0], encryptedCandidate.inputProof);

    // Get user's encrypted vote
    const encryptedUserVote = await communityVotingContract.getUserVote(signers.alice.address);
    
    // Decrypt user's vote
    const decryptedVote = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedUserVote,
      communityVotingContractAddress,
      signers.alice,
    );

    expect(decryptedVote).to.eq(candidateId);
  });

  it("should authorize user for decryption and allow vote count decryption", async function () {
    const candidateId = 0;

    // Alice votes
    const encryptedCandidate = await fhevm.userEncryptEuint(
      FhevmType.euint32,
      candidateId,
      communityVotingContractAddress,
      signers.alice,
    );

    await communityVotingContract
      .connect(signers.alice)
      .vote(encryptedCandidate.handles[0], encryptedCandidate.inputProof);

    // Authorize Bob for decryption
    await communityVotingContract.connect(signers.alice).authorizeUserForDecryption(signers.bob.address);

    // Bob should now be able to decrypt vote counts
    const encryptedCounts = await communityVotingContract.getVoteCounts();

    // Decrypt candidate 1 votes (should be 1)
    const decryptedCandidate1Votes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts.candidate1Votes,
      communityVotingContractAddress,
      signers.bob,
    );

    expect(decryptedCandidate1Votes).to.eq(1);
  });

  it("should reject authorization with zero address", async function () {
    await expect(
      communityVotingContract.connect(signers.alice).authorizeUserForDecryption(ethers.ZeroAddress)
    ).to.be.revertedWith("Invalid user address");
  });

  it("should handle multiple votes correctly", async function () {
    // Alice votes for candidate 0
    const encryptedCandidate0 = await fhevm.userEncryptEuint(
      FhevmType.euint32,
      0,
      communityVotingContractAddress,
      signers.alice,
    );

    await communityVotingContract
      .connect(signers.alice)
      .vote(encryptedCandidate0.handles[0], encryptedCandidate0.inputProof);

    // Bob votes for candidate 1
    const encryptedCandidate1 = await fhevm.userEncryptEuint(
      FhevmType.euint32,
      1,
      communityVotingContractAddress,
      signers.bob,
    );

    await communityVotingContract
      .connect(signers.bob)
      .vote(encryptedCandidate1.handles[0], encryptedCandidate1.inputProof);

    // Authorize Alice for decryption
    await communityVotingContract.connect(signers.alice).authorizeUserForDecryption(signers.alice.address);

    // Check vote counts
    const encryptedCounts = await communityVotingContract.getVoteCounts();

    const decryptedCandidate0Votes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts.candidate1Votes,
      communityVotingContractAddress,
      signers.alice,
    );

    const decryptedCandidate1Votes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts.candidate2Votes,
      communityVotingContractAddress,
      signers.alice,
    );

    const decryptedTotalVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts.totalVotes,
      communityVotingContractAddress,
      signers.alice,
    );

    expect(decryptedCandidate0Votes).to.eq(1);
    expect(decryptedCandidate1Votes).to.eq(1);
    expect(decryptedTotalVotes).to.eq(2);
  });

  it("should prevent voting with invalid candidate ID", async function () {
    // Try to vote with candidate ID 5 (invalid)
    const encryptedCandidate = await fhevm.userEncryptEuint(
      FhevmType.euint32,
      5,
      communityVotingContractAddress,
      signers.alice,
    );

    await expect(
      communityVotingContract
        .connect(signers.alice)
        .vote(encryptedCandidate.handles[0], encryptedCandidate.inputProof)
    ).to.be.revertedWith("Invalid candidate ID: must be 0-3");
  });
});

