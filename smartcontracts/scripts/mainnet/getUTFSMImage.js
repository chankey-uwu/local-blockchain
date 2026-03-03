const hre = require("hardhat");
const fs = require("fs");

const originalConsoleLog = console.log;
console.log = function (...args) {
    if (typeof args[0] === 'string' && args[0].includes("JsonRpcProvider failed to detect network")) return;
    originalConsoleLog.apply(console, args);
};

function decodeHexToPNG(hexString, outputPath) {
    try {
        const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
        const imageBuffer = Buffer.from(cleanHex, 'hex');

        fs.writeFileSync(outputPath, imageBuffer);
        
        console.log("PNG file stored at: " + outputPath);
    } catch (error) {
        console.error("Error decoding: ", error.message);
    }
}

async function main() {
    const contractAddress = "0x6eF07900cD0a72CEb2EdCe5D1e58D251A6B14eca"; 

    const mainnetProvider = new hre.ethers.JsonRpcProvider(
        hre.network.config.url, 
        undefined, 
        { staticNetwork: true }
    );

    const artifact = await hre.artifacts.readArtifact("UTFSM");
    const contract = new hre.ethers.Contract(contractAddress, artifact.abi, mainnetProvider);

    const fullySigned = await contract.isFullySigned();

    if (fullySigned !== "0x") {
        const outputPath = './src/EthereumUTFSMLogo.png';
        decodeHexToPNG(fullySigned, outputPath);
    } else {
        console.log("The contract is not fully signed yet. The image hasn't been confirmed by the parties.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});