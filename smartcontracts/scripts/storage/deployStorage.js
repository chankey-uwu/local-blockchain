const hre = require("hardhat");

const CONTRACT_OWNER_ADDRESS = "0x79Ce52DeFC7e6B78737eAB5bF18747FF089CFBCA";

async function main() {
    console.log(`Deploying Storage contract with owner: ${CONTRACT_OWNER_ADDRESS}`);
    
    const signer = await hre.ethers.provider.getSigner(CONTRACT_OWNER_ADDRESS);
    const contractFactory = await hre.ethers.getContractFactory("Storage", signer);
    
    const contract = await contractFactory.deploy();
    console.log("Waiting for approval to deploy...");

    await contract.waitForDeployment();

    const deploymentTransaction = contract.deploymentTransaction();
    const receipt = await deploymentTransaction.wait();

    const address = await contract.getAddress();
    const gasUsed = receipt.gasUsed;

    console.log(`Contract address: ${address}. Gas used: ${gasUsed.toString()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});