const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

const clefAccountAddress = "0x5a905A373Ee3f07915Eadcd334546d38Ab43Afd5";

const recipientAddress = "0x8943545177806ED17B9F23F0a21ee5948eCaa776";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    try {
        const network = await provider.getNetwork();
        console.log(`Conectado a la red: ${network.chainId}`);
    } catch (e) {
        console.error("Error conectando al nodo.");
        return;
    }

    console.log("Esperando conexión con Clef ...");

    const signer = await provider.getSigner(clefAccountAddress);

    console.log(`\nPreparando envío desde cuenta gestionada por Clef: ${signer.address}`);

    const balance = await provider.getBalance(signer.address);
    console.log(`Balance actual: ${ethers.formatEther(balance)} ETH`);

    console.log(`Esperando aprobación en Clef para enviar 1.5 ETH a ${recipientAddress}...`);

    try {
        const tx = await signer.sendTransaction({
            to: recipientAddress,
            value: ethers.parseEther("1.5")
        });

        console.log(`\nTransacción confirmada: ${tx.hash}`);
        console.log("Esperando confirmación de red...");
        
        await tx.wait();
        console.log("Transacción confirmada en bloque.");

        const newBalance = await provider.getBalance(signer.address);
        console.log(`Nuevo balance: ${ethers.formatEther(newBalance)} ETH`);

    } catch (error) {
        console.error("\nError al enviar la transacción:");
        console.error("Posible causa: No aprobaste en Clef a tiempo o Clef no está conectado.");
        console.error(error.message);
    }
}

main();