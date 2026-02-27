const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

async function getSingleBalance(account) {

    if (!ethers.isAddress(account)) {
        throw new Error("La dirección proporcionada no es válida.");
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);

    try {
        const balance = await provider.getBalance(account);

        return ethers.formatEther(balance);
    } catch (e) {
        throw new Error("Error al conectar con el nodo o consultar el balance.");
    }
}

module.exports = { getSingleBalance };