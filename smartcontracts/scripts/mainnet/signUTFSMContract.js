const hre = require("hardhat");

const toHex = (val) => "0x" + BigInt(val).toString(16);

const originalConsoleLog = console.log;
console.log = function (...args) {
    if (typeof args[0] === 'string' && args[0].includes("JsonRpcProvider failed to detect network")) return;
    originalConsoleLog.apply(console, args);
};

const clefSignerAdresses = {
    "partyA": "0x79Ce52DeFC7e6B78737eAB5bF18747FF089CFBCA",
    "partyB": "0x5396846b57f6881FD73Deac1011Bc948D5ae9721",
}

const contractAddress = "0x6eF07900cD0a72CEb2EdCe5D1e58D251A6B14eca";

async function main() {
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
    
    const artifact = await hre.artifacts.readArtifact("UTFSM");
    const contract = new hre.ethers.Contract(contractAddress, artifact.abi, mainnetProvider);

    const option = "B";

    let clefSignerAddress, messageToSign, partyName;

    if (option === "A") {
        clefSignerAddress = clefSignerAdresses.partyA;
        messageToSign = await contract.messageA();
        partyName = "A";
    } else if (option === "B") {
        clefSignerAddress = clefSignerAdresses.partyB;
        messageToSign = await contract.messageB();
        partyName = "B";
    } else if (option === "awrong") {
        clefSignerAddress = clefSignerAdresses.partyB;
        messageToSign = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("Incorrect message"));
        partyName = "A (Incorrect message)";
    } else {
        clefSignerAddress = "0x79Ce52DeFC7e6B78737eAB5bF18747FF089CFBCA";
        messageToSign = await contract.messageA();
        partyName = "C (Not authorized)";
    }

    console.log(`Party ${partyName} (${clefSignerAddress}) is trying to sign...`);

    const unsignedTx = await contract.signAgreement.populateTransaction(messageToSign);

    const nonce = await mainnetProvider.getTransactionCount(clefSignerAddress);
    const feeData = await mainnetProvider.getFeeData();

    let estimatedGas;
    try {
        estimatedGas = await mainnetProvider.estimateGas({
            to: contractAddress,
            from: clefSignerAddress,
            data: unsignedTx.data
        });
    } catch (error) {
        console.log("WARNING: gas cost estimation failed, using fallback value. Error: " + error.message);
        estimatedGas = 100000n;
    }
    const safetyGasLimit = (estimatedGas * 125n) / 100n;

    const txToSign = {
        to: contractAddress,
        from: clefSignerAddress,
        data: unsignedTx.data,
        nonce: toHex(nonce),
        gas: toHex(safetyGasLimit), 
        maxFeePerGas: toHex(feeData.maxFeePerGas),
        maxPriorityFeePerGas: toHex(feeData.maxPriorityFeePerGas),
        value: "0x0",
        chainId: toHex(chainId),
        type: "0x2"
    };

    console.log(">>> CONFIRM TRANSACTION IN CLEF <<<");

    const signedTxResponse = await clefProvider.send("account_signTransaction", [txToSign]);
    
    console.log("Signature obtained from Clef.");

    // Difundir a la red
    const txResponse = await mainnetProvider.broadcastTransaction(signedTxResponse.raw);
    console.log(`Transaction sent. Hash: ${txResponse.hash}`);

    const receipt = await txResponse.wait();
    
    if (receipt.status === 1) {
        console.log(`Success: Contract signed by Party ${partyName}. Gas used: ${receipt.gasUsed.toString()}`);
    } else {
        console.log(`Failed: The transaction of Party ${partyName} was reverted by the contract.`);
    }
}

main().catch((error) => {
    if (error.error && error.error.message) {
        console.error("Clef Error: " + error.error.message);
    } else {
        console.error("Transaction Error:", error.shortMessage || error.message);
    }
    process.exitCode = 1;
});