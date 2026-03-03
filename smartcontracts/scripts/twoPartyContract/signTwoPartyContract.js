const { sign } = require("crypto");
const hre = require("hardhat");

const clefSignerAdresses = {
    "partyA": "0x79Ce52DeFC7e6B78737eAB5bF18747FF089CFBCA",
    "partyB": "0x5396846b57f6881FD73Deac1011Bc948D5ae9721",
}
const contractAddress = "0x633cc8C973C0E0E4FDEDC657B348625d104B2649";

async function main() {
    const rpcUrl = hre.network.config.url;
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);
    const artifact = await hre.artifacts.readArtifact("TwoPartyContract");
    const contract = new hre.ethers.Contract(contractAddress, artifact.abi, provider);

    console.log(`Reading the contract in address: ${contractAddress}\n`);

    const option = "B"; // "A" o "B"
    var clefSignerAddress, message, party;

    if (option === "A") {
        clefSignerAddress = clefSignerAdresses.partyA;
        message = await contract.messageA();
        party = "A";
    } else if (option === "B") {
        clefSignerAddress = clefSignerAdresses.partyB;
        message = await contract.messageB();
        party = "B";
    } else if (option === "awrong") {
        clefSignerAddress = clefSignerAdresses.partyA;
        message = "This is an incorrect message for Party A";
        party = "A";
    } else {
        clefSignerAddress = "0xAD2F1ED52B71c9e9bC1AB96a88e075F26A1F9d97";
        message = await contract.messageA();
        party = "C (contract owner, not a party)";
    }

    console.log(`Party ${party} (${clefSignerAddress}) is signing the contract with message: ${message} ...`);

    const signer = await provider.getSigner(clefSignerAddress);
    const contractWithSigner = contract.connect(signer);
    const tx = await contractWithSigner.signAgreement(message);

    const receipt = await tx.wait();
    if (!receipt.status) {
        console.error(`Transaction failed. Party ${party} could not sign the contract.`);
        return;
    }
    const gasUsed = receipt.gasUsed;
    console.log(`Contract signed by Party ${party}. Transaction hash: ${tx.hash}. Gas used: ${gasUsed.toString()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});