const hre = require("hardhat");

const CONTRACT_ADDRESS = "0x386Dcf5d72F701AD20CDfBEBf668E11b5eCb1Ff0";

async function main() {
    // 1. Tomamos la URL de tu hardhat.config.js
    const rpcUrl = hre.network.config.url; 
    
    // 2. Creamos un proveedor puro de lectura
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);

    // 3. Obtenemos el ABI del contrato compilado
    const artifact = await hre.artifacts.readArtifact("TwoPartyContract");

    // 4. Instanciamos el contrato conectándolo ÚNICAMENTE al proveedor (cero Signers)
    const contract = new hre.ethers.Contract(CONTRACT_ADDRESS, artifact.abi, provider);

    console.log(`Reading the contract at address: ${CONTRACT_ADDRESS}\n`);

    console.log("partyA:", await contract.partyA());
    console.log("partyB:", await contract.partyB());
    console.log("partyASigned:", await contract.partyASigned());
    console.log("partyBSigned:", await contract.partyBSigned());
    console.log("isFullySigned:", await contract.isFullySigned());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});