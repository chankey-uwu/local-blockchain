const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

async function executeTransfer(fromAddress, toAddress, amountEth, privateKey = null) {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    try {
        await provider.getNetwork();
    } catch (e) {
        throw new Error("Error conectando al nodo RPC.");
    }

    let signer;

    if (privateKey) {
        signer = new ethers.Wallet(privateKey, provider);
        console.log(`Usando Wallet local (Llave Privada): ${signer.address}`);
    } else {
        console.log("Esperando conexión con Clef...");
        signer = await provider.getSigner(fromAddress);
        console.log(`Usando Signer externo (Clef): ${signer.address}`);
    }

    const balanceBefore = await provider.getBalance(fromAddress);
    console.log(`Balance inicial: ${ethers.formatEther(balanceBefore)} ETH`);

    try {
        console.log(`Enviando ${amountEth} ETH a ${toAddress}...`);
        
        const tx = await signer.sendTransaction({
            to: toAddress,
            value: ethers.parseEther(amountEth),
        });

        console.log(`Tx enviada. Hash: ${tx.hash}`);
        const receipt = await tx.wait();
        
        const balanceAfter = await provider.getBalance(fromAddress);
        console.log(`Transacción confirmada en bloque.`);
        console.log(`Nuevo balance: ${ethers.formatEther(balanceAfter)} ETH`);

        return { success: true, hash: tx.hash, receipt };
    } catch (error) {
        console.error("Error en la transacción.");
        throw error;
    }
}

module.exports = { executeTransfer };