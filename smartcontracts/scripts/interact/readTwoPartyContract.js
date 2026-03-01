const hre = require("hardhat");

async function main() {
    const contractAddress = "0xA9c0be9a55324c4Da46EB5D95Fbfa3e067485943";

    const rpcUrl = hre.network.config.url;
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);

    const artifact = await hre.artifacts.readArtifact("TwoPartyContract");

    const contract = new hre.ethers.Contract(contractAddress, artifact.abi, provider);

    console.log(`Reading the contract in address: ${contractAddress}\n`);

    const isPartyASigned = await contract.partyASigned();
    const isPartyBSigned = await contract.partyBSigned();
    const messageA = await contract.messageA();
    const messageB = await contract.messageB();
    const fullySigned = await contract.isFullySigned();

    console.log("=== Messages stored in the contract ===");
    console.log(`Message A: ${messageA}`);
    console.log(`Message B: ${messageB}`);
    console.log("=== Parties Signature status ===");
    console.log(`Party A Signature? : ${isPartyASigned}`);
    console.log(`Party B Signature? : ${isPartyBSigned}`);
    console.log("===================================");
    console.log(fullySigned);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});