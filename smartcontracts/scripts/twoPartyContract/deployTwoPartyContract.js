const hre = require("hardhat");

async function main() {
    // 1. Configura tus direcciones aqui
    const deployerAddress = "0xFDA39044B2A06F7A152f213617C01f87E5b4e41B"; 
    
    const partyA = "0x79Ce52DeFC7e6B78737eAB5bF18747FF089CFBCA";
    const partyB = "0x5396846b57f6881FD73Deac1011Bc948D5ae9721"; 
    const randomSeed = 123456;

    const rpcUrl = hre.network.config.url; 
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);
    const signer = await provider.getSigner(deployerAddress);

    console.log("Preparando el contrato TwoPartyContract...");
    const ContractFactory = await hre.ethers.getContractFactory("TwoPartyContract");
    const factoryWithSigner = ContractFactory.connect(signer);

    console.log("\n>>> REVISA TU TERMINAL DE CLEF EN WINDOWS PARA APROBAR <<<");
    
    // 2. Aqui le pasamos los argumentos que exige tu constructor en Solidity
    const contract = await factoryWithSigner.deploy(partyA, partyB, randomSeed);

    console.log("\nTransaccion enviada. Esperando a que el bloque se mine (aprox 12 segundos)...");
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    
    console.log("\n==================================================");
    console.log(`EXITO! Copia esta direccion: ${address}`);
    console.log("==================================================\n");
}

main().catch((error) => {
    console.error("Error en el despliegue:", error);
    process.exitCode = 1;
});