const hre = require("hardhat");

const INTERACTOR_ADDRESS = "0x5396846b57f6881FD73Deac1011Bc948D5ae9721";
const CONTRACT_ADDRESS = "0x9533ECd4a32A796c44Ca55855b1847D0459A5A5C";

async function main() {
    console.log(`Interacting with Storage contract with signer: ${INTERACTOR_ADDRESS}`);
    
    const signer = await hre.ethers.provider.getSigner(INTERACTOR_ADDRESS);
    const contract = await hre.ethers.getContractAt("Storage", CONTRACT_ADDRESS, signer);
    
    const numberToSStore = 1931;

    const tx = await contract.store(numberToSStore);
    console.log("Waiting for transaction confirmation...");

    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed;

    console.log(`Transaction hash: ${tx.hash}. Gas used: ${gasUsed.toString()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});