const hre = require("hardhat");

async function main() {
    const yubikeyAddress = "0x5a905A373Ee3f07915Eadcd334546d38Ab43Afd5";
    const yubikeySigner = await hre.ethers.provider.getSigner(yubikeyAddress);

    const Wallet = await hre.ethers.getContractFactory("Wallet");
    const contractFactoryWithSigner = Wallet.connect(yubikeySigner);

    console.log(`Waiting for ${yubikeyAddress} approval ...`);
    
    const wallet = await contractFactoryWithSigner.deploy();

    console.log("Waiting for deployment confirmation...");
    await wallet.waitForDeployment();

    console.log(`Smart Contract deployed at: ${wallet.target}`);

    const owner = await wallet.owner();
    console.log(`Smart Contract owner account: ${owner}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});