const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

const clefSignerAccountAddress = "0x79Ce52DeFC7e6B78737eAB5bF18747FF089CFBCA";

const recipientAddress = "0x5396846b57f6881FD73Deac1011Bc948D5ae9721";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    await provider.getNetwork();

    console.log("Waiting Clef connection ...");
    const signer = await provider.getSigner(clefSignerAccountAddress);
    console.log("Waiting for transaction approval ...");

    try {
        const amountToSend = "42";
        const ethToSend = ethers.parseEther(amountToSend);
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