const { sign } = require("crypto");
const hre = require("hardhat");

const clefSignerAdresses = {
    "partyA": "0x52CaD1dD85CaAB26D097966c30c8a8F83417C567",
    "partyB": "0x3D360431960B93a2e2aD7733c8f56e8304d5e551",
}
const contractAddress = "0xA9c0be9a55324c4Da46EB5D95Fbfa3e067485943";

async function main() {
    const rpcUrl = hre.network.config.url;
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);
    const artifact = await hre.artifacts.readArtifact("TwoPartyContract");
    const contract = new hre.ethers.Contract(contractAddress, artifact.abi, provider);

    console.log(`Reading the contract in address: ${contractAddress}\n`);

    const party = "B"; // "A" o "B"
    var clefDignerAddress, message;

    if (party === "A") {
        clefDignerAddress = clefSignerAdresses.partyA;
        message = await contract.messageA();
    } else if (party === "B") {
        clefDignerAddress = clefSignerAdresses.partyB;
        message = await contract.messageB();
    } else {
        console.error("Invalid party selection. Choose 'A' or 'B'.");
        return;
    }

    const balance = await provider.getBalance(clefDignerAddress);
    if (balance < hre.ethers.parseEther("0.000000000001")) {
        console.error(`Party ${party} has no funds.`);
        return;
    }

    const signer = await provider.getSigner(clefDignerAddress);
    const contractWithSigner = contract.connect(signer);
    
    console.log(`Sending transaction...`);
    
    const tx = await contractWithSigner.signAgreement(message);

    console.log(`Transaction sent by Party ${party} (${clefDignerAddress}). Tx Hash: ${tx.hash}`);    
    console.log("Waiting for transaction confirmation...");

    await tx.wait();
    console.log(`Transaction confirmed. Party ${party} has signed the contract.`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});