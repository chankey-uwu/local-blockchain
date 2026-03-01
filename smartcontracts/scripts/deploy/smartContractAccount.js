const hre = require("hardhat");

async function main() {
    const yubikeyAddress = "0xAD2F1ED52B71c9e9bC1AB96a88e075F26A1F9d97";
    const yubikeySigner = await hre.ethers.provider.getSigner(yubikeyAddress);

    const Wallet = await hre.ethers.getContractFactory("SmartContractAccount");
    const contractFactoryWithSigner = Wallet.connect(yubikeySigner);

    console.log(`Waiting for ${yubikeyAddress} approval ...`);
    
    const smartContractAccount = await contractFactoryWithSigner.deploy();

    console.log("Waiting for deployment confirmation...");
    await smartContractAccount.waitForDeployment();

    console.log(`Smart Contract deployed at: ${smartContractAccount.target}`);

    const owner = await smartContractAccount.owner();
    console.log(`Smart Contract owner account: ${owner}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});