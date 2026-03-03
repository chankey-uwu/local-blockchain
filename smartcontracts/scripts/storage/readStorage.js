const hre = require("hardhat");

const CONTRACT_ADDRESS = "0x9533ECd4a32A796c44Ca55855b1847D0459A5A5C";

async function main() {
    const provider = hre.ethers.provider;

    const storage = await hre.ethers.getContractAt("Storage", CONTRACT_ADDRESS, provider);

    let currentValue = await storage.retrieve();
    console.log(`Current stored value: ${currentValue}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});