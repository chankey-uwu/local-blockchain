const { randomBytes } = require("crypto");
const hre = require("hardhat");

async function main() {
    const contractOwnerAddress = "0x79Ce52DeFC7e6B78737eAB5bF18747FF089CFBCA";

    // 1. Mainnet
    const mainnetRpcUrl = hre.network.config.url; 
    const mainnetProvider = new hre.ethers.JsonRpcProvider(mainnetRpcUrl);

    // 2. Clef
    const clefUrl = "http://127.0.0.1:8550";
    const clefProvider = new hre.ethers.JsonRpcProvider(clefUrl);

    // 3. Conectar el signer de Clef al provider de Mainnet
    const baseSigner = await clefProvider.getSigner(contractOwnerAddress);
    const signer = baseSigner.connect(mainnetProvider);

    const ContractFactory = await hre.ethers.getContractFactory("emitTest");
    
    const contractFactoryWithSigner = ContractFactory.connect(signer);

    console.log("--- Iniciando proceso con Clef ---");
    
    console.log("Calculando costos estimados en red real...");
    const deployTx = await contractFactoryWithSigner.getDeployTransaction();
    const gasEstimate = await mainnetProvider.estimateGas(deployTx);
    const feeData = await mainnetProvider.getFeeData();
    
    const totalCostEth = hre.ethers.formatEther(gasEstimate * feeData.gasPrice);
    
    console.log(`Unidades de gas: ${gasEstimate.toString()}`);
    console.log(`Costo total estimado: ${totalCostEth} ETH`);

    console.log(`Solicitando firma en Clef para la cuenta: ${contractOwnerAddress}`);
    console.log("REVISA TU TERMINAL DE CLEF PARA APROBAR LA TRANSACCION");

    const contract = await contractFactoryWithSigner.deploy();

    console.log("Esperando confirmacion en la blockchain...");
    await contract.waitForDeployment();

    const receipt = await contract.deploymentTransaction().wait();

    console.log(`Smart Contract desplegado exitosamente en: ${contract.target}`);
    console.log(`Gas real utilizado: ${receipt.gasUsed.toString()}`);
}

main().catch((error) => {
    console.error("Error durante el proceso:", error);
    process.exitCode = 1;
});