const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

const accountsToCheck = [
    "0xAD2F1ED52B71c9e9bC1AB96a88e075F26A1F9d97",
]

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    try {
        const network = await provider.getNetwork();
        console.log(`Conectado a la red: ${network.chainId}`);
    } catch (e) {
        console.error("Error conectando. Revisa el puerto RPC de Kurtosis.");
        return;
    }

    for (const account of accountsToCheck) {
        const balance = await provider.getBalance(account);
        console.log(`Balance de ${account}: ${ethers.formatEther(balance)} ETH`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});