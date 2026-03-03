const { ethers } = require("ethers");

const originalConsoleLog = console.log;
console.log = function (...args) {
    if (typeof args[0] === 'string' && args[0].includes("JsonRpcProvider failed to detect network")) return;
    originalConsoleLog.apply(console, args);
};

const toHex = (val) => "0x" + BigInt(val).toString(16);

const MAINNET_RPC_URL = "https://eth-mainnet.g.alchemy.com/v2/mXaADGzvNO3m6igVuTT7-";
const CLEF_URL = "http://127.0.0.1:8550";
const CHAIN_ID = 1; 

const signerAccountAddress = "0x79Ce52DeFC7e6B78737eAB5bF18747FF089CFBCA";
const recipientAddress = "0x5396846b57f6881FD73Deac1011Bc948D5ae9721";

async function main() {
    const mainnetProvider = new ethers.JsonRpcProvider(MAINNET_RPC_URL, CHAIN_ID, { staticNetwork: true });
    const clefProvider = new ethers.JsonRpcProvider(CLEF_URL, CHAIN_ID, { staticNetwork: true });

    console.log("Starting transfer from " + signerAccountAddress + " to " + recipientAddress);

    try {
        const amountToSend = "0.00000051";
        const ethToSend = ethers.parseEther(amountToSend);

        const nonce = await mainnetProvider.getTransactionCount(signerAccountAddress);
        const feeData = await mainnetProvider.getFeeData();

        const baseTx = {
            to: recipientAddress,
            from: signerAccountAddress,
            value: ethToSend
        };

        const estimatedGas = await mainnetProvider.estimateGas(baseTx);
        const safetyGasLimit = (estimatedGas * 125n) / 100n;

        const txToSign = {
            to: recipientAddress,
            from: signerAccountAddress,
            nonce: toHex(nonce),
            gas: toHex(safetyGasLimit),
            maxFeePerGas: toHex(feeData.maxFeePerGas),
            maxPriorityFeePerGas: toHex(feeData.maxPriorityFeePerGas),
            value: toHex(ethToSend),
            chainId: toHex(CHAIN_ID),
            type: "0x2"
        };

        const signerBalanceBefore = await mainnetProvider.getBalance(signerAccountAddress);
        const recipientBalanceBefore = await mainnetProvider.getBalance(recipientAddress);
        console.log(`Signer ${signerAccountAddress} balance before transfer: ${ethers.formatEther(signerBalanceBefore)} ETH`);
        console.log(`Recipient ${recipientAddress} balance before transfer: ${ethers.formatEther(recipientBalanceBefore)} ETH`);
        console.log(">>> VERIFY TRANSACTION IN CLEF <<<");

        const signedTxResponse = await clefProvider.send("account_signTransaction", [txToSign]);
        console.log("Transaction signed succesfully. Broadcasting to network...");

        const txResponse = await mainnetProvider.broadcastTransaction(signedTxResponse.raw);
        console.log("Transaction. Hash: " + txResponse.hash);
        const receipt = await txResponse.wait();
        
        console.log("SUCCESS: Transaction confirmed.");
        console.log(signerAccountAddress + " envio " + amountToSend + " ETH a " + recipientAddress);
        console.log("Gas used: " + receipt.gasUsed.toString());

        const signerBalanceAfter = await mainnetProvider.getBalance(signerAccountAddress);
        const recipientBalanceAfter = await mainnetProvider.getBalance(recipientAddress);
        console.log(`Signer ${signerAccountAddress} balance after transfer: ${ethers.formatEther(signerBalanceAfter)} ETH`);
        console.log(`Recipient ${recipientAddress} balance after transfer: ${ethers.formatEther(recipientBalanceAfter)} ETH`);

    } catch (error) {
        if (error.error && error.error.message) {
            console.error("Clef error: " + error.error.message);
        } else {
            console.error("Critical error: ", error);
        }
        process.exitCode = 1;
    }
}

main();