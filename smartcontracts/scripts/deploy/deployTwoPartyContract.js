const { randomBytes } = require("crypto");
const hre = require("hardhat");

async function main() {
    const contractOwnerAddress = "0xAD2F1ED52B71c9e9bC1AB96a88e075F26A1F9d97";
    const partyAAddress = "0x52CaD1dD85CaAB26D097966c30c8a8F83417C567"
    const partyBAddress = "0x3D360431960B93a2e2aD7733c8f56e8304d5e551"
    const randomSeed = "0x" + randomBytes(32).toString("hex");

    const signer = await hre.ethers.provider.getSigner(contractOwnerAddress);

    const ContractFactory = await hre.ethers.getContractFactory("TwoPartyContract");
    const contractFactoryWithSigner = ContractFactory.connect(signer);

    console.log(`Waiting for ${contractOwnerAddress} approval to deploy...`);

    const contract = await contractFactoryWithSigner.deploy(partyAAddress, partyBAddress, randomSeed);

    console.log("Waiting for deployment confirmation...");
    await contract.waitForDeployment();

    console.log(`Smart Contract TwoPartyContract deployed at: ${contract.target}`);

    const storedPartyA = await contract.partyA();
    const storedPartyB = await contract.partyB();
    const storedMessageA = await contract.messageA();
    const storedMessageB = await contract.messageB();
    console.log(`Party A Address: ${storedPartyA}`);
    console.log(`Party B Address: ${storedPartyB}`);
    console.log(`Message A: ${storedMessageA}`);
    console.log(`Message B: ${storedMessageB}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});