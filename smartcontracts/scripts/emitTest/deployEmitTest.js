const { randomBytes } = require("crypto");
const hre = require("hardhat");

async function main() {
    const contractOwnerAddress = "0xAD2F1ED52B71c9e9bC1AB96a88e075F26A1F9d97";

    const rpcUrl = hre.network.config.url;
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);

    const signer = await provider.getSigner(contractOwnerAddress);

    const ContractFactory = await hre.ethers.getContractFactory("emitTest");
    const contractFactoryWithSigner = ContractFactory.connect(signer);

    console.log(`Waiting for ${contractOwnerAddress} approval to deploy...`);

    const contract = await contractFactoryWithSigner.deploy();

    console.log("Waiting for deployment confirmation...");
    await contract.waitForDeployment();

    const deploymentTransaction = contract.deploymentTransaction();
    const receipt = await deploymentTransaction.wait();

    console.log(`Smart Contract emitTest deployed at: ${contract.target}. Gas used: ${receipt.gasUsed.toString()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});