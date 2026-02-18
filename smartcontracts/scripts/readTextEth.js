const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

const contractAddress = "0xb4B46bdAA835F8E4b4d8e208B6559cD267851051"

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    try {
        const network = await provider.getNetwork();
        console.log(`Conectado a la red: ${network.chainId}`);
    } catch (e) {
        console.error("Error conectando. Revisa el puerto RPC de Kurtosis.");
        return;
    }

    const hexData = await provider.getCode(contractAddress);

    const text = Buffer.from(hexData.substring(2), 'hex').toString('utf8');

    console.log(`Mensaje recuperado de ${contractAddress}:`);
    console.log(`>>> ${text} <<<`);
}

main().catch((error) => {
    console.error("\x1b[31m%s\x1b[0m", "Fallo crítico:");
    console.error(error);
    process.exit(1);
});