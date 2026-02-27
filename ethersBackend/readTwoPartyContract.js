const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

/**
 * Ejecuta una transacción desde un SmartContractAccount.
 * @param {string} ownerAddress - Dirección del dueño (Signer en Clef o PKey).
 * @param {string} scaAddress - Dirección del contrato SmartContractAccount.
 * @param {string} recipient - Dirección del destinatario de los fondos/data.
 * @param {string} amountEth - Cantidad de ETH a enviar (ej: "0.1").
 * @param {string} message - Mensaje de texto para convertir a bytes.
 * @param {Array} abi - El ABI del contrato SmartContractAccount.
 * @param {string|null} privateKey - Opcional. Si se provee, firma localmente.
 */
async function readTwoPartyContract(ownerAddress, scaAddress, recipient, amountEth, message, abi, privateKey = null) {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    try {
        await provider.getNetwork();
    } catch (e) {
        throw new Error("Error: No se pudo conectar al nodo RPC.");
    }

    let signer;
    if (privateKey) {
        signer = new ethers.Wallet(privateKey, provider);
    } else {
        signer = await provider.getSigner(ownerAddress);
    }

    const smartContractAccount = new ethers.Contract(scaAddress, abi, signer);

    try {
        const owner = await smartContractAccount.owner();
        const balanceWei = await provider.getBalance(scaAddress);
        
        console.log(`Dueño del contrato: ${owner}`);
        console.log(`Balance del contrato: ${ethers.formatEther(balanceWei)} ETH`);

        if (balanceWei === 0n) {
            throw new Error("El contrato no tiene fondos suficientes.");
        }

        const amountToSend = ethers.parseEther(amountEth);
        const hexMessage = ethers.hexlify(ethers.toUtf8Bytes(message));

        console.log(`Ejecutando desde SCA hacia ${recipient}...`);

        const tx = await smartContractAccount.execute(recipient, amountToSend, hexMessage);
        
        console.log(`Transacción enviada: ${tx.hash}`);
        const receipt = await tx.wait();

        return {
            success: true,
            hash: tx.hash,
            block: receipt.blockNumber,
            fromSCA: scaAddress,
            to: recipient
        };
    } catch (error) {
        console.error("Fallo en la ejecución del Smart Contract Account:");
        throw error;
    }
}

module.exports = { readTwoPartyContract };