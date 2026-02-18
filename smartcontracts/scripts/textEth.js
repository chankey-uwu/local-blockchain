const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:32003";

const genesisAccounts = [
    { address: "0x8943545177806ED17B9F23F0a21ee5948eCaa776", pkey: "bcdf20249abf0ed6d944c0288fad489e33f66b3960d9e6229c1cd214ed3bbe31" },
];

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    try {
        const network = await provider.getNetwork();
        console.log(`Conectado a la red: ${network.chainId}`);
    } catch (e) {
        console.error("Error conectando. Revisa el puerto RPC de Kurtosis.");
        return;
    }

    const wallet = new ethers.Wallet(genesisAccounts[0].pkey, provider);

    const filePath = path.join(__dirname, "./data/message.txt");
    const rawText = fs.readFileSync(filePath, "utf8").trim();
    console.log(`Contenido de message.txt: ${rawText}`);

    const textHash = ethers.id(rawText);
    console.log(`Hash del mensaje: ${textHash}`);
    

    const bytesText = ethers.toUtf8Bytes(textHash);
    const hexText = ethers.hexlify(bytesText).replace("0x", "");
    
    const size = bytesText.length;
    console.log(`Tamaño del mensaje en bytes: ${size}`);

    const sizeHex = size.toString(16).padStart(2, '0');
    console.log(`Tamaño del mensaje en hexadecimal: ${sizeHex}`);

    const sizeHexSinPadstart = size.toString(16);
    console.log(`Tamaño del mensaje en hexadecimal sin padStart: ${sizeHexSinPadstart}`);

    // Prefijo es la serie de opcodes para almacenar el contrato de texto
    // Definidos en https://www.evm.codes/ 
    // 60 <size>      PUSH1 <size del texto>
    // 600c           PUSH1 0x0c (offset del texto)
    // 600039         PUSH1 0x00, CODECOPY
    // 60 <size>      PUSH1 <size del texto>
    // 6000f3         PUSH1 0x00, RETURN
    const prefix = `60${sizeHex}600c60003960${sizeHex}6000f3`;
    
    const fullBytecode = "0x" + prefix + hexText;
    
    const tx = {
        to: null,
        data: fullBytecode,
    };

    console.log("Enviando transacción...");
    const transactionResponse = await wallet.sendTransaction(tx);
    console.log(`Hash: ${transactionResponse.hash}`);

    const receipt = await transactionResponse.wait();

    if (receipt){
        console.log("\n--- Receipt Completo (JSON) ---");
        console.log(JSON.stringify(receipt.toJSON(), null, 2));
        console.log("-------------------------------\n");
    }
}

main().catch((error) => {
    console.error("\x1b[31m%s\x1b[0m", "Fallo crítico:");
    console.error(error);
    process.exit(1);
});