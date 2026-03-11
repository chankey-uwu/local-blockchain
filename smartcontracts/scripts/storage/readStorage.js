const hre = require("hardhat");

const CONTRACT_ADDRESS = "0x0728aba35e05ea32eA2b02F62e029Cf994510195";

async function main() {

    // Hardhat automatically connects to the selected network
    const provider = hre.ethers.provider;

    // Load contract ABI from artifacts
    const artifact = await hre.artifacts.readArtifact("Storage");

    // Create contract instance
    const storage = new hre.ethers.Contract(
        CONTRACT_ADDRESS,
        artifact.abi,
        provider
    );

    // Call view function
    const currentValue = await storage.retrieve();

    console.log(`Current stored value: ${currentValue.toString()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});