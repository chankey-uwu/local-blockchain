const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

async function getDecodedBytecode(contractAddress) {
    if (!ethers.isAddress(contractAddress)) {
        throw new Error("La dirección del contrato no es válida.");
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);

    try {
        const hexData = await provider.getCode(contractAddress);

        if (hexData === "0x") {
            throw new Error("No se encontró código en la dirección proporcionada.");
        }

        const text = Buffer.from(hexData.substring(2), 'hex').toString('utf8');
        
        return text;
    } catch (e) {
        throw new Error(`Error al recuperar el bytecode: ${e.message}`);
    }
}

module.exports = { getDecodedBytecode };