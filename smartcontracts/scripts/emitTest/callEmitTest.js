const hre = require("hardhat");

async function main() {
    const contractAddress = "";
    const signerAddress = "0xAD2F1ED52B71c9e9bC1AB96a88e075F26A1F9d97";
    const rpcUrl = hre.network.config.url;
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);

    const signer = await provider.getSigner(signerAddress);
    const contractWithSigner = contract.connect(signer);
    const tx = await contractWithSigner.signAgreement(message);
    const receipt = await tx.wait();

    console.log(`Reading the contract in address: ${contractAddress}\n`);

    const gasUsed = receipt.gasUsed;
    console.log(`Contract signed by ${signerAddress}. Transaction hash: ${tx.hash}. Gas used: ${gasUsed.toString()}`)

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});