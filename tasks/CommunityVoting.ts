import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FhevmType } from "@fhevm/hardhat-plugin";

task("voting:getCounts", "Get encrypted vote counts for all candidates")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers, fhevm } = hre;
    const CommunityVotingDeployment = await deployments.get("CommunityVoting");
    const communityVotingContract = await ethers.getContractAt(
      "CommunityVoting",
      CommunityVotingDeployment.address
    );

    console.log("Getting vote counts...");
    const voteCounts = await communityVotingContract.getVoteCounts();

    if (fhevm.isMock) {
      const signers = await ethers.getSigners();
      const decrypted1 = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        voteCounts[0],
        CommunityVotingDeployment.address,
        signers[0],
      );
      const decrypted2 = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        voteCounts[1],
        CommunityVotingDeployment.address,
        signers[0],
      );
      const decrypted3 = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        voteCounts[2],
        CommunityVotingDeployment.address,
        signers[0],
      );
      const decrypted4 = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        voteCounts[3],
        CommunityVotingDeployment.address,
        signers[0],
      );
      const decryptedTotal = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        voteCounts[4],
        CommunityVotingDeployment.address,
        signers[0],
      );

      console.log("Decrypted Vote Counts:");
      console.log(`Candidate 1: ${decrypted1}`);
      console.log(`Candidate 2: ${decrypted2}`);
      console.log(`Candidate 3: ${decrypted3}`);
      console.log(`Candidate 4: ${decrypted4}`);
      console.log(`Total: ${decryptedTotal}`);
    } else {
      console.log("Vote counts (encrypted):");
      console.log(`Candidate 1: ${voteCounts[0]}`);
      console.log(`Candidate 2: ${voteCounts[1]}`);
      console.log(`Candidate 3: ${voteCounts[2]}`);
      console.log(`Candidate 4: ${voteCounts[3]}`);
      console.log(`Total: ${voteCounts[4]}`);
      console.log("Note: Decryption requires user authentication on testnet");
    }
  });

task("voting:checkHasVoted", "Check if an address has voted")
  .addParam("address", "The address to check")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const CommunityVotingDeployment = await deployments.get("CommunityVoting");
    const communityVotingContract = await ethers.getContractAt(
      "CommunityVoting",
      CommunityVotingDeployment.address
    );

    const hasVoted = await communityVotingContract.checkHasVoted(taskArgs.address);
    console.log(`Address ${taskArgs.address} has ${hasVoted ? "" : "not "}voted`);
  });

task("voting:authorize", "Authorize a user for vote count decryption")
  .addParam("user", "The address to authorize")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const CommunityVotingDeployment = await deployments.get("CommunityVoting");
    const communityVotingContract = await ethers.getContractAt(
      "CommunityVoting",
      CommunityVotingDeployment.address
    );

    const signers = await ethers.getSigners();
    const tx = await communityVotingContract.connect(signers[0]).authorizeUserForDecryption(taskArgs.user);
    await tx.wait();

    console.log(`Successfully authorized ${taskArgs.user} for vote count decryption`);
  });

task("voting:vote", "Cast a vote for a candidate (mock mode only)")
  .addParam("candidate", "Candidate ID (0-3)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers, fhevm } = hre;

    if (!fhevm.isMock) {
      console.error("This task only works in mock mode (local Hardhat network)");
      return;
    }

    const CommunityVotingDeployment = await deployments.get("CommunityVoting");
    const communityVotingContract = await ethers.getContractAt(
      "CommunityVoting",
      CommunityVotingDeployment.address
    );

    const signers = await ethers.getSigners();
    const candidateId = parseInt(taskArgs.candidate);

    if (candidateId < 0 || candidateId > 3) {
      console.error("Candidate ID must be between 0 and 3");
      return;
    }

    console.log(`Casting vote for candidate ${candidateId}...`);

    // Encrypt the candidate ID
    const encryptedCandidate = await fhevm.userEncryptEuint(
      FhevmType.euint32,
      candidateId,
      CommunityVotingDeployment.address,
      signers[0],
    );

    // Submit the vote
    const tx = await communityVotingContract
      .connect(signers[0])
      .vote(encryptedCandidate.handles[0], encryptedCandidate.inputProof);

    await tx.wait();

    console.log(`Successfully voted for candidate ${candidateId}`);
    console.log(`Transaction hash: ${tx.hash}`);
  });

task("voting:getUserVote", "Get a user's encrypted vote")
  .addParam("address", "The voter's address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const CommunityVotingDeployment = await deployments.get("CommunityVoting");
    const communityVotingContract = await ethers.getContractAt(
      "CommunityVoting",
      CommunityVotingDeployment.address
    );

    const userVote = await communityVotingContract.getUserVote(taskArgs.address);
    console.log(`Encrypted vote for ${taskArgs.address}: ${userVote}`);
  });

task("voting:stats", "Get voting statistics")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const CommunityVotingDeployment = await deployments.get("CommunityVoting");
    const communityVotingContract = await ethers.getContractAt(
      "CommunityVoting",
      CommunityVotingDeployment.address
    );

    console.log("Voting Statistics:");
    console.log("==================");

    // Get vote counts
    const voteCounts = await communityVotingContract.getVoteCounts();
    console.log("Vote counts retrieved (encrypted):", voteCounts);

    // Get contract info
    const numCandidates = await communityVotingContract.NUM_CANDIDATES();
    console.log(`Number of candidates: ${numCandidates}`);

    console.log(`Contract address: ${CommunityVotingDeployment.address}`);
    console.log(`Deployed at block: ${CommunityVotingDeployment.receipt?.blockNumber || 'Unknown'}`);
  });

