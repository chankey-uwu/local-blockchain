const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    try {
        const network = await provider.getNetwork();
        console.log(`Conectado a la red: ${network.chainId}`);
    } catch (e) {
        console.error("Error conectando a la red:", e);
        return;
    }

    try {
        const address = await provider.send("eth_yubiKeyInfo", []);
        console.log(`Resultado de eth_yubiKeyInfo: \n${address}`);
    } catch (e) {
        console.error("Error ejecutando eth_yubiKeyInfo.", e);
        return;
    }
}

main();