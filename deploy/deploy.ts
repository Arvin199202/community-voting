import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log(`Deploying CommunityVoting contract from: ${deployer}`);

  const communityVoting = await deploy("CommunityVoting", {
    from: deployer,
    log: true,
    waitConfirmations: hre.network.name === "hardhat" ? 1 : 5,
  });

  console.log(`✅ CommunityVoting contract deployed at: ${communityVoting.address}`);

  // Verify deployment by checking if contract exists
  const deployedContract = await hre.ethers.getContractAt("CommunityVoting", communityVoting.address);
  const numCandidates = await deployedContract.NUM_CANDIDATES();

  console.log(`✅ Contract verification successful`);
  console.log(`   - Number of candidates: ${numCandidates}`);
  console.log(`   - Network: ${hre.network.name}`);

  // Log useful commands
  console.log(`\n📋 Useful commands:`);
  console.log(`   View vote counts: npx hardhat voting:getCounts --network ${hre.network.name}`);
  console.log(`   Check if voted: npx hardhat voting:checkHasVoted --network ${hre.network.name} --address <user-address>`);
  console.log(`   Authorize decryption: npx hardhat voting:authorize --network ${hre.network.name} --user <user-address>`);

  if (hre.network.name === "sepolia") {
    console.log(`\n🔗 Sepolia Etherscan: https://sepolia.etherscan.io/address/${communityVoting.address}`);
  }
};
export default func;
func.id = "deploy_community_voting"; // id required to prevent reexecution
func.tags = ["CommunityVoting"];

