const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    let fromAddresses;
    try {
        fromAddresses = await provider.send("eth_yubiKeyInfo");
        console.log(`Resultado de eth_yubiKeyInfo:\n${fromAddresses}`);
    } catch (e) {
        console.error("Error ejecutando eth_yubiKeyInfo.", e);
        return;
    }

    const fromAddress = fromAddresses[0];
    console.log(`Usando la dirección desde YubiKey: ${fromAddress}`);

    const toAddress = "0x8943545177806ED17B9F23F0a21ee5948eCaa776";

    try {
        const network = await provider.getNetwork();
        console.log(`Conectado a la red: ${network.chainId}`);
    } catch (e) {
        console.error("Error conectando a la red:", e);
        return;
    }

    const value = ethers.parseEther("0.1");
    const valueHex = "0x" + value.toString(16);

    const txArgs = {
        from: fromAddress,
        to: toAddress,
        value: valueHex,
    };

    const yubiKeyArgs = {
    };

    try {
        console.log("Iniciando transacción con YubiKey...");
        
        const txHash = await provider.send("eth_sendYubiKeyTransaction", [txArgs, yubiKeyArgs]);
        
        console.log(`¡Éxito! Hash de la transacción: ${txHash}`);
        
        console.log("Esperando confirmación...");
        const receipt = await provider.waitForTransaction(txHash);
        console.log("Transacción confirmada en el bloque:", receipt.blockNumber);

    } catch (e) {
        console.error("Error ejecutando eth_sendYubiKeyTransaction:");
        if (e.error && e.error.message) {
            console.error("Mensaje de Geth:", e.error.message);
        } else {
            console.error(e);
        }
    }
}

main();