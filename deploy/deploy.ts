import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying CommunityVoting contract...");

  const communityVoting = await deploy("CommunityVoting", {
    from: deployer,
    log: true,
    args: [],
  });

  console.log(`CommunityVoting contract deployed at: ${communityVoting.address}`);

  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    console.log("Skipping verification on local network");
  } else {
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: communityVoting.address,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }
};
export default func;
func.id = "deploy_community_voting";
func.tags = ["CommunityVoting", "all"];

