const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

const clefSignerAccountAddress = "0x3D360431960B93a2e2aD7733c8f56e8304d5e551";

const recipientAddress = "0x633cc8C973C0E0E4FDEDC657B348625d104B2649";

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

    const signer = await provider.getSigner(clefSignerAccountAddress);

    console.log(`\nPreparando envío desde cuenta gestionada por Clef: ${signer.address}`);

    const balance = await provider.getBalance(signer.address);
    console.log(`Balance actual: ${ethers.formatEther(balance)} ETH`);

    console.log(`Esperando aprobación en Clef para enviar 0 ETH a ${recipientAddress}...`);

    try {
        const tx = await signer.sendTransaction({
            to: recipientAddress,
            value: ethers.parseEther("0")
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