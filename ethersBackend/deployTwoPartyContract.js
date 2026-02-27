const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:32003";

/**
 * Despliega el contrato TwoPartySignature de forma dinámica.
 * @param {string} ownerAddress - Dirección que paga el despliegue (Signer en Clef o PKey).
 * @param {string} partyA - Dirección de la primera parte firmante.
 * @param {string} partyB - Dirección de la segunda parte firmante.
 * @param {Array} abi - El ABI del contrato TwoPartySignature.
 * @param {string} bytecode - El Bytecode del contrato TwoPartySignature.
 * @param {string|null} privateKey - Opcional. Si se provee, firma localmente.
 */
async function deployTwoPartyContract(ownerAddress, partyA, partyB, abi, bytecode, privateKey = null) {
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
        signer = await provider.getSigner(ownerAddress);
    }

    console.log(`Solicitando despliegue desde: ${signer.address}`);

    try {
        const factory = new ethers.ContractFactory(abi, bytecode, signer);

        const contract = await factory.deploy(partyA, partyB);

        console.log(`Transacción de despliegue enviada: ${contract.deploymentTransaction().hash}`);
        
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();

        return {
            success: true,
            address: contractAddress,
            hash: contract.deploymentTransaction().hash,
            partyA: await contract.partyA(),
            partyB: await contract.partyB()
        };
    } catch (error) {
        console.error("Fallo en el despliegue del contrato:");
        throw error;
    }
}

module.exports = { deployTwoPartyContract };