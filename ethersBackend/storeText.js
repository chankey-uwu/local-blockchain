const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

async function storeTextAsContract(textInput, fromAddress, privateKey = null) {
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
        signer = await provider.getSigner(fromAddress);
    }

    const textHash = ethers.id(textInput);
    const bytesText = ethers.toUtf8Bytes(textHash);
    const hexText = ethers.hexlify(bytesText).replace("0x", "");
    
    const size = bytesText.length;
    const sizeHex = size.toString(16).padStart(2, '0');
    
    // Prefijo: PUSH1 <size> PUSH1 0x0c PUSH1 0x00 CODECOPY PUSH1 <size> PUSH1 0x00 RETURN
    const prefix = `60${sizeHex}600c60003960${sizeHex}6000f3`;
    const fullBytecode = "0x" + prefix + hexText;

    try {
        const tx = {
            to: null,
            data: fullBytecode,
        };

        const transactionResponse = await signer.sendTransaction(tx);
        const receipt = await transactionResponse.wait();

        return {
            success: true,
            hash: transactionResponse.hash,
            contractAddress: receipt.contractAddress,
            storedHash: textHash
        };
    } catch (error) {
        throw error;
    }
}

module.exports = { storeTextAsContract };