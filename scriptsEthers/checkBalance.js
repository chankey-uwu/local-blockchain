const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

const accountToCheck0 = "0x5396846b57f6881FD73Deac1011Bc948D5ae9721";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    await provider.getNetwork();
    
    const balance0 = await provider.getBalance(accountToCheck0.trim());
    console.log(`${accountToCheck0.trim()} balance is ${ethers.formatEther(balance0)} ETH`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});