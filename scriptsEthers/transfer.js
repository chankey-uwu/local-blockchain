const { ethers, ZeroAddress } = require("ethers");


const RPC_URL = "http://127.0.0.1:32003"; 

const genesisAccounts = [
    { address: "0x8943545177806ED17B9F23F0a21ee5948eCaa776", pkey: "bcdf20249abf0ed6d944c0288fad489e33f66b3960d9e6229c1cd214ed3bbe31" },
    { address: "0xE25583099BA105D9ec0A67f5Ae86D90e50036425", pkey: "39725efee3fb28614de3bacaffe4cc4bd8c436257e2c8bb887c4b5c4be45e76d" },
];

const recipientAddress = "0xd5d96d668B5f0F25C7e875B67Bf003b04E7276d6";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    try {
        const network = await provider.getNetwork();
        console.log(`Conectado a la red: ${network.chainId}`);
    } catch (e) {
        console.error("Error conectando. Revisa el puerto RPC de Kurtosis.");
        return;
    }

    const whaleWallet = new ethers.Wallet(genesisAccounts[0].pkey, provider);

    console.log(`Cuenta Ballena usada para el envío: ${whaleWallet.address}`);

    const balanceBefore = await provider.getBalance(whaleWallet.address);
    console.log(`Balance de ${whaleWallet.address}:`);
    console.log(`${ethers.formatEther(balanceBefore)} ETH`);

    const amountToSend = ethers.parseEther("1000"); 

    console.log(`Enviando 1000 ETH a ${recipientAddress}...`);
    
    const tx = await whaleWallet.sendTransaction({
        to: recipientAddress,
        value: amountToSend,
    });

    console.log(`Tx Hash: ${tx.hash}`);
    console.log("Esperando confirmación...");

    const receipt = await tx.wait();
    console.log("Transacción confirmada en el bloque.");

    const balanceAfter = await provider.getBalance(whaleWallet.address);
    console.log(`Nuevo Balance de ${whaleWallet.address}:`);
    console.log(`${ethers.formatEther(balanceAfter)} ETH`);

    if (receipt){
        console.log("--- Receipt Completo (JSON) ---");
        console.log(JSON.stringify(receipt.toJSON(), null, 2));
        console.log("-------------------------------\n");
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});