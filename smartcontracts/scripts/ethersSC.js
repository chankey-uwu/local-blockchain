const { ethers } = require("ethers");
const fs = require("fs");

const RPC_URL = "http://127.0.0.1:32003"; 

const genesisAccounts = [
    { address: "0x8943545177806ED17B9F23F0a21ee5948eCaa776", pkey: "bcdf20249abf0ed6d944c0288fad489e33f66b3960d9e6229c1cd214ed3bbe31" },
    { address: "0xE25583099BA105D9ec0A67f5Ae86D90e50036425", pkey: "39725efee3fb28614de3bacaffe4cc4bd8c436257e2c8bb887c4b5c4be45e76d" },
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
    
    const whaleWallet = new ethers.Wallet(genesisAccounts[0].pkey, provider);

    let bytecode = fs.readFileSync("./contracts_Storage_sol_Storage.bin", "utf8").trim();
    if (!bytecode.startsWith("0x")) {
        bytecode = "0x" + bytecode;
    }

    const tx ={
        to: null,
        data: bytecode,
    };

    const transactionResponse = await whaleWallet.sendTransaction(tx);
    const receipt = await transactionResponse.wait();

    console.log(`Contrato desplegado en la dirección: ${receipt.contractAddress}`);

}

main().catch(console.error);