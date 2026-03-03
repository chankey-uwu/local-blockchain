const hre = require("hardhat");

async function main() {
    const contractAddress = "0x633cc8C973C0E0E4FDEDC657B348625d104B2649";

    const rpcUrl = hre.network.config.url;
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);

    const artifact = await hre.artifacts.readArtifact("TwoPartyContract");

    const contract = new hre.ethers.Contract(contractAddress, artifact.abi, provider);

    console.log(`Reading the contract in address: ${contractAddress}\n`);

    const isPartyASigned = await contract.partyASigned();
    const isPartyBSigned = await contract.partyBSigned();
    const fullySigned = await contract.isFullySigned();

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