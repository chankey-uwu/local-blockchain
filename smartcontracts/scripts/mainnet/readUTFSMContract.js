const hre = require("hardhat");

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

    console.log(`Reading contract at address: ${contractAddress}\n`);

    const isPartyASigned = await contract.partyASigned();
    const isPartyBSigned = await contract.partyBSigned();

    console.log("=== Signature state ===");
    console.log(`Signature A Party? : ${isPartyASigned}`);
    console.log(`Signature B Party? : ${isPartyBSigned}`);
    console.log("=======================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});