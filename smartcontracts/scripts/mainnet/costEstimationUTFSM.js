const hre = require("hardhat");

async function main() {
    // 1. Conexión solo de lectura (sin Clef)
    const mainnetProvider = new hre.ethers.JsonRpcProvider(hre.network.config.url);
    
    // Tu dirección pública (no se necesita la llave privada)
    const yubiKeyAddress = "0x79Ce52DeFC7e6B78737eAB5bF18747FF089CFBCA";
    const partyB = "0x5396846b57f6881FD73Deac1011Bc948D5ae9721";
    const randomSeed = 123456789n; // Seed temporal para la simulación

    // 2. Preparar los datos del contrato
    const ContractFactory = await hre.ethers.getContractFactory("UTFSM");
    const deployTxData = await ContractFactory.getDeployTransaction(yubiKeyAddress, partyB, randomSeed);

    console.log("Simulando despliegue en la EVM del nodo...");

    // 3. Solicitar estimación (GRATIS y SIN FIRMA)
    const estimatedGas = await mainnetProvider.estimateGas({
        from: yubiKeyAddress,
        data: deployTxData.data
    });

    // 4. Consultar el precio del gas en este instante
    const feeData = await mainnetProvider.getFeeData();
    
    // 5. Calcular costo total: Unidades de gas * Precio del gas
    const totalCostWei = estimatedGas * feeData.maxFeePerGas;
    const totalCostEth = hre.ethers.formatEther(totalCostWei);

    console.log("--- PRESUPUESTO DE DESPLIEGUE ---");
    console.log(`Unidades de Gas requeridas : ${estimatedGas.toString()}`);
    console.log(`Precio del Gas (Max)       : ${hre.ethers.formatUnits(feeData.maxFeePerGas, "gwei")} gwei`);
    console.log(`Costo total estimado       : ${totalCostEth} ETH`);
    console.log("---------------------------------");
}

main().catch(console.error);