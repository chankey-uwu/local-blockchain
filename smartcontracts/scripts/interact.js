const hre = require("hardhat");

const CONTRACT_ADDRESS = "0x422A3492e218383753D8006C7Bfa97815B44373F";

async function main() {
    const storage = await hre.ethers.getContractAt("Storage", CONTRACT_ADDRESS);

    console.log(`Conectado al contrato en: ${CONTRACT_ADDRESS}`);

    let currentValue = await storage.retrieve();
    console.log(`\nValor inicial almacenado: ${currentValue}`);

    const tx = await storage.store(1020202020);
    console.log(`Tx Hash: ${tx.hash}`);

    console.log("Esperando confirmación del bloque...");

    await tx.wait();

    currentValue = await storage.retrieve();
    console.log(`\n¡Éxito! Nuevo valor almacenado: ${currentValue}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});