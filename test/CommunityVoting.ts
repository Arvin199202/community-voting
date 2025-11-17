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
    const [candidate1Votes, candidate2Votes, candidate3Votes, candidate4Votes, totalVotes] = encryptedCounts;

    expect(await fhevm.decrypt(communityVotingContractAddress, candidate1Votes)).to.equal(0);
    expect(await fhevm.decrypt(communityVotingContractAddress, candidate2Votes)).to.equal(0);
    expect(await fhevm.decrypt(communityVotingContractAddress, candidate3Votes)).to.equal(0);
    expect(await fhevm.decrypt(communityVotingContractAddress, candidate4Votes)).to.equal(0);
    expect(await fhevm.decrypt(communityVotingContractAddress, totalVotes)).to.equal(0);
  });

  it("should handle minting tokens with boundary conditions", async function () {
    const mintAmount = 100;

    await expect(communityVotingContract.connect(signers.alice).mintVotingTokens(signers.alice.address, mintAmount))
      .to.emit(communityVotingContract, "VoteCountsUpdated");

    const encryptedCounts = await communityVotingContract.getVoteCounts();
    const totalVotes = encryptedCounts[4];
    expect(await fhevm.decrypt(communityVotingContractAddress, totalVotes)).to.equal(mintAmount);

    await expect(communityVotingContract.connect(signers.alice).mintVotingTokens(signers.alice.address, 0))
      .to.be.revertedWith("Amount must be positive");

    await expect(communityVotingContract.connect(signers.alice).mintVotingTokens(signers.alice.address, 1))
      .to.emit(communityVotingContract, "VoteCountsUpdated");
  });

  it("should allow users to vote for different candidates", async function () {
    const vote1 = fhevm.createEncryptedInput(await communityVotingContract.getAddress(), signers.alice.address);
    vote1.add8(0); // Vote for candidate 1
    const encryptedVote1 = vote1.encrypt();

    const vote2 = fhevm.createEncryptedInput(await communityVotingContract.getAddress(), signers.bob.address);
    vote2.add8(1); // Vote for candidate 2
    const encryptedVote2 = vote2.encrypt();

    await expect(communityVotingContract.connect(signers.alice).vote(encryptedVote1.handles[0], encryptedVote1.inputProof))
      .to.emit(communityVotingContract, "VoteCast");

    await expect(communityVotingContract.connect(signers.bob).vote(encryptedVote2.handles[0], encryptedVote2.inputProof))
      .to.emit(communityVotingContract, "VoteCast");

    const encryptedCounts = await communityVotingContract.getVoteCounts();
    expect(await fhevm.decrypt(communityVotingContractAddress, encryptedCounts[0])).to.equal(1); // Candidate 1
    expect(await fhevm.decrypt(communityVotingContractAddress, encryptedCounts[1])).to.equal(1); // Candidate 2
  });

  it("should prevent double voting", async function () {
    const vote = fhevm.createEncryptedInput(await communityVotingContract.getAddress(), signers.alice.address);
    vote.add8(0);
    const encryptedVote = vote.encrypt();

    await communityVotingContract.connect(signers.alice).vote(encryptedVote.handles[0], encryptedVote.inputProof);

    await expect(communityVotingContract.connect(signers.alice).vote(encryptedVote.handles[0], encryptedVote.inputProof))
      .to.be.revertedWith("CommunityVoting: already voted");
  });

  it("should allow proposal creation with valid inputs", async function () {
    const title = "Test Proposal";
    const description = "This is a test proposal for community voting system";

    await expect(communityVotingContract.connect(signers.alice).createProposal(title, description))
      .to.emit(communityVotingContract, "ProposalCreated");

    const proposal = await communityVotingContract.proposals(0);
    expect(proposal.title).to.equal(title);
    expect(proposal.description).to.equal(description);
    expect(proposal.creator).to.equal(signers.alice.address);
    expect(proposal.active).to.be.true;
  });

  it("should reject proposal creation with empty title", async function () {
    await expect(communityVotingContract.connect(signers.alice).createProposal("", "Valid description"))
      .to.be.revertedWith("Title cannot be empty");
  });

  it("should reject proposal creation with empty description", async function () {
    await expect(communityVotingContract.connect(signers.alice).createProposal("Valid title", ""))
      .to.be.revertedWith("Description cannot be empty");
  });
    
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
});

