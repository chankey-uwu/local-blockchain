const { randomBytes } = require("crypto");
const hre = require("hardhat");

const toHexQty = (val) => "0x" + BigInt(val).toString(16);

const originalConsoleLog = console.log;
console.log = function (...args) {
    if (
        typeof args[0] === "string" &&
        args[0].includes("JsonRpcProvider failed to detect network")
    ) {
        return;
    }
    originalConsoleLog.apply(console, args);
};

async function waitForReceipt(provider, txHash, { pollMs = 2500, timeoutMs = 10 * 60 * 1000 } = {}) {
    const start = Date.now();

    while (true) {
        const receipt = await provider.send("eth_getTransactionReceipt", [txHash]);
        if (receipt) return receipt;

        if (Date.now() - start > timeoutMs) {
            throw new Error(`Timeout esperando receipt de ${txHash}`);
        }

        await new Promise((r) => setTimeout(r, pollMs));
    }
}

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
        signTransaction: async (tx) => {
            // Clef: account_signTransaction
            const result = await clefProvider.send("account_signTransaction", [tx]);
            return result.raw;
        },
        connect: () => clefSigner,
    };

    console.log("--- Starting UTFSM Contract Deployment ---");

    const randomSeed = hre.ethers.getBigInt(hre.ethers.hexlify(randomBytes(32)));
    const constructorArgs = [partyA, partyB, randomSeed];

    const ContractFactory = await hre.ethers.getContractFactory("UTFSM");
    const deployTx = await ContractFactory.getDeployTransaction(...constructorArgs);

    // Nonce / fees / network
    const nonce = await mainnetProvider.getTransactionCount(partyA);
    const feeData = await mainnetProvider.getFeeData();
    const network = await mainnetProvider.getNetwork();

    if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
        throw new Error("feeData incompleto (maxFeePerGas / maxPriorityFeePerGas null). Revisa tu RPC o usa gasPrice legacy.");
    }

    // Estimar gas para deploy: from + data
    const estimatedGas = await mainnetProvider.estimateGas({
        from: partyA,
        data: deployTx.data,
    });

    const safetyGasLimit = (estimatedGas * 125n) / 100n;

    // Importante: NO incluir `to` en absoluto (contract creation)
    const txToSign = {
        from: partyA,
        data: deployTx.data,
        nonce: toHexQty(nonce),
        gas: toHexQty(safetyGasLimit),
        maxFeePerGas: toHexQty(feeData.maxFeePerGas),
        maxPriorityFeePerGas: toHexQty(feeData.maxPriorityFeePerGas),
        value: "0x0",
        chainId: toHexQty(network.chainId),
        type: "0x2",
        // accessList: [], // opcional
    };

    console.log("\n>>> CONFIRM TRANSACTION IN CLEF <<<");

    const signedRawTx = await clefSigner.signTransaction(txToSign);

    // Broadcast
    const txResponse = await mainnetProvider.broadcastTransaction(signedRawTx);
    console.log("Tx hash: " + txResponse.hash);

    // NO usar txResponse.wait() (ethers peta si el nodo devuelve to:"")
    const receipt = await waitForReceipt(mainnetProvider, txResponse.hash);

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