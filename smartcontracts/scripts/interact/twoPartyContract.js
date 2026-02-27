const hre = require("hardhat");

async function main() {
    const contractAddress = "0xA9c0be9a55324c4Da46EB5D95Fbfa3e067485943";

    const rpcUrl = hre.network.config.url;
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);

    const artifact = await hre.artifacts.readArtifact("TwoPartySignature");

    const contract = new hre.ethers.Contract(contractAddress, artifact.abi, provider);

    console.log(`Reading the contract in address: ${contractAddress}\n`);

    const isPartyASigned = await contract.partyASigned();
    const isPartyBSigned = await contract.partyBSigned();
    const fullySigned = await contract.isFullySigned();

    console.log("=== Parties Signature status ===");
    console.log(`Party A Signature? : ${isPartyASigned}`);
    console.log(`Party B Signature? : ${isPartyBSigned}`);
    console.log("===================================");
    console.log(`Contract fully signed? : ${fullySigned}\n`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});