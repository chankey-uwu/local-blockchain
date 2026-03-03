const { time } = require("console");
const { randomBytes } = require("crypto");
const hre = require("hardhat");

const toHex = (val) => "0x" + BigInt(val).toString(16);

const originalConsoleLog = console.log;
console.log = function (...args) {
    if (typeof args[0] === 'string' && args[0].includes("JsonRpcProvider failed to detect network")) {
        return;
    }
    originalConsoleLog.apply(console, args);
};

async function main() {
    const initialTime = Date.now();
    const partyA = "0x79Ce52DeFC7e6B78737eAB5bF18747FF089CFBCA";
    const partyB = "0x5396846b57f6881FD73Deac1011Bc948D5ae9721";

    const chainId = hre.network.config.chainId;

    const mainnetProvider = new hre.ethers.JsonRpcProvider(
        hre.network.config.url, 
        chainId, 
        { staticNetwork: true }
    );

    const clefProvider = new hre.ethers.JsonRpcProvider(
        "http://127.0.0.1:8550", 
        chainId, 
        { staticNetwork: true }
    );

    const clefSigner = {
        address: partyA,
        provider: clefProvider,
        // Clef uses account_signTransaction, not eth_sendTransaction
        signTransaction: async (tx) => {
            const result = await clefProvider.send("account_signTransaction", [tx]);
            return result.raw;
        },
        connect: (p) => clefSigner 
    };

    console.log("--- Starting UTFSM Contract Deployment ---");

    const randomSeed = hre.ethers.getBigInt(hre.ethers.hexlify(randomBytes(32)));
    const constructorArgs = [partyA, partyB, randomSeed];
    
    const ContractFactory = await hre.ethers.getContractFactory("UTFSM");
    const contract  = await ContractFactory.getDeployTransaction(...constructorArgs);

    const nonce = await mainnetProvider.getTransactionCount(partyA);
    const feeData = await mainnetProvider.getFeeData();
    const network = await mainnetProvider.getNetwork();

    const estimatedGas = await mainnetProvider.estimateGas({
        from: partyA,
        data: contract.data
    });
    const safetyGasLimit = (estimatedGas * 125n) / 100n; 

    const txToSign = {
        from: partyA,
        to: null,
        data: contract.data,
        nonce: toHex(nonce),
        gas: toHex(safetyGasLimit),
        maxFeePerGas: toHex(feeData.maxFeePerGas),
        maxPriorityFeePerGas: toHex(feeData.maxPriorityFeePerGas),
        value: "0x0",
        chainId: toHex(network.chainId),
        type: "0x2"
    };

    console.log("\n>>> CONFIRM TRANSACTION IN CLEF <<<");

    const signedRawTx = await clefSigner.signTransaction(txToSign);

    console.log(signedRawTx);

    const txResponse = await mainnetProvider.broadcastTransaction(signedRawTx);

    console.log("Tx hash: " + txResponse.hash);

    const receipt = await txResponse.wait();
    const endTime = Date.now();
    const duration = (endTime - initialTime) / 1000;
    console.log(`Contract deployed in ${duration.toFixed(2)} seconds.`);
    console.log("Contract Address: " + receipt.contractAddress);
}

main().catch((error) => {
    if (error.error && error.error.message) {
        console.error("Clef Error: " + error.error.message);
    } else {
        console.error("Critical Error: ", error);
    }
    process.exitCode = 1;
});