const hre = require("hardhat");

async function main() {
    const ownerAddress = "0x5a905A373Ee3f07915Eadcd334546d38Ab43Afd5";
    const contractAddress = "0xE738a7c3169bb50025F2437d603B84f6D10A16E3";
    const recipientAddress = "0xAD2F1ED52B71c9e9bC1AB96a88e075F26A1F9d97";

    const ownerSigner = await hre.ethers.provider.getSigner(ownerAddress);

    const smartContractAccount = await hre.ethers.getContractAt(
        "SmartContractAccount",
        contractAddress,
        ownerSigner
    );

    const owner = await smartContractAccount.owner();
    console.log("Contract owner address:", owner);

    const balanceWei = await hre.ethers.provider.getBalance(contractAddress);
    const balanceEth = hre.ethers.formatEther(balanceWei);
    console.log("Current contract balance:", balanceEth, "ETH");

    if (balanceWei > 0n) {
        console.log("Waiting for deployment confirmation...");

        const amountToSend = hre.ethers.parseEther("0.1");
        const message = "HOLA MUNDO";
        const hexMessage = hre.ethers.hexlify(hre.ethers.toUtf8Bytes(message));

        const tx = await smartContractAccount.execute(recipientAddress, amountToSend, hexMessage);

        console.log("Transaction hash:", tx.hash);

        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
    } else {
        console.error("Error: Contract has no balance.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});