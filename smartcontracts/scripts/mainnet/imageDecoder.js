const fs = require('fs');

// 1. CODIFICAR: De PNG físico a String Hexadecimal (Para poner en tu .sol)
function encodePNGToHex(filePath) {
    try {
        const imageBuffer = fs.readFileSync(filePath);
        const hexString = "0x" + imageBuffer.toString('hex');
        
        console.log("Imagen convertida a Hexadecimal.");
        console.log("-> Tamano original: " + imageBuffer.length + " bytes");
        
        return hexString;
    } catch (error) {
        console.error("Error al codificar: ", error.message);
        return null;
    }
}

// 2. DECODIFICAR: De String Hexadecimal (traído del contrato) a PNG físico
function decodeHexToPNG(hexString, outputPath) {
    try {
        const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
        const imageBuffer = Buffer.from(cleanHex, 'hex');

        fs.writeFileSync(outputPath, imageBuffer);
        
        console.log("Archivo PNG restaurado y guardado en: " + outputPath);
    } catch (error) {
        console.error("Error al decodificar: ", error.message);
    }
}

// --- Flujo de Prueba ---
async function main() {
    const inputPath = './src/Logo_UTFSM.png';
    const outputPath = './src/NewLogo_UTFSM.png';

    if (fs.existsSync(inputPath)) {
        const hexData = encodePNGToHex(inputPath);
        console.log(hexData);

        decodeHexToPNG(hexData, outputPath);
    } else {
        console.log("Falta el archivo Logo_UTFSM.png para probar.");
    }
}

main();