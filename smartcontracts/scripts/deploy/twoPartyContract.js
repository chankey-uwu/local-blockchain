const hre = require("hardhat");

async function main() {
    const contractOwnerAddress = "0xAD2F1ED52B71c9e9bC1AB96a88e075F26A1F9d97";
    const partyAAddress = "0x5a905A373Ee3f07915Eadcd334546d38Ab43Afd5"
    const partyBAddress = "0x91bF8EFDad91A7ED68c7953aD7e38b0C41308CfC"

    const signer = await hre.ethers.provider.getSigner(contractOwnerAddress);

    const ContractFactory = await hre.ethers.getContractFactory("TwoPartySignature");
    const contractFactoryWithSigner = ContractFactory.connect(signer);

    console.log(`Waiting for ${contractOwnerAddress} approval to deploy...`);

    const contract = await contractFactoryWithSigner.deploy(partyAAddress, partyBAddress);

    console.log("Waiting for deployment confirmation...");
    await contract.waitForDeployment();

    console.log(`Smart Contract TwoPartySignature deployed at: ${contract.target}`);

    const storedPartyA = await contract.partyA();
    const storedPartyB = await contract.partyB();
    console.log(`Registered Party A: ${storedPartyA}`);
    console.log(`Registered Party B: ${storedPartyB}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});