const { ethers } = require("ethers");


const RPC_URL = "http://127.0.0.1:32003"; 

const genesisAccounts = [
    { address: "0x8943545177806ED17B9F23F0a21ee5948eCaa776", pkey: "bcdf20249abf0ed6d944c0288fad489e33f66b3960d9e6229c1cd214ed3bbe31" },
    { address: "0xE25583099BA105D9ec0A67f5Ae86D90e50036425", pkey: "39725efee3fb28614de3bacaffe4cc4bd8c436257e2c8bb887c4b5c4be45e76d" },
];

const recipientAddress = "0x47A5471364A9d61444284AB1d79aF6DBb641B181";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    await provider.getNetwork();

    const whaleWallet = new ethers.Wallet(genesisAccounts[0].pkey, provider);
    const ammountToSend = "1000";
    const ethToSend = ethers.parseEther(ammountToSend); 
    const tx = await whaleWallet.sendTransaction({
        to: recipientAddress,
        value: ethToSend,
    });
    await tx.wait();
    console.log(`${recipientAddress} funded with ${ethers.formatEther(ethToSend)} ETH. Transaction hash: ${tx.hash}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});