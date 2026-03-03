const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

const clefSignerAccountAddress = "0xAD2F1ED52B71c9e9bC1AB96a88e075F26A1F9d97";

const recipientAddress = "0xB03C8599446732C34B65633E91485195AEe2885D";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    await provider.getNetwork();

    console.log("Waiting Clef connection ...");
    const signer = await provider.getSigner(clefSignerAccountAddress);
    console.log("Waiting for transaction approval ...");

    try {
        const ammounToSend = "42";
        const ethToSend = ethers.parseEther(ammounToSend);
        const tx = await signer.sendTransaction({
            to: recipientAddress,
            value: ethToSend
        });
    
        console.log(`Transaction approved and sent. Hash: ${tx.hash}`);

        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed;

        console.log(`${clefSignerAccountAddress} sent ${ethers.formatEther(ethToSend)} ETH to ${recipientAddress}. Gas used: ${gasUsed.toString()}`);
    } catch (error) {
        console.error(error.message);
    }
}

main();