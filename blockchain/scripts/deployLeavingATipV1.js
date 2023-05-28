const { ethers, upgrades } = require("hardhat");

async function main() {
    const LeavingATip = await ethers.getContractFactory("LeavingATip");

    console.log("Deploying LeavingATip...");

    const leavingATip = await upgrades.deployProxy(LeavingATip, [["0x326C977E6efc84E512bB9C30f76E30c160eD06FB"]], {
    initializer: "initialize",
    });
    await leavingATip.deployed();
    console.log("LeavingATip deployed to:", leavingATip.address);

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(
        leavingATip.address
      );
        console.log('Implementation contract address: ' + implementationAddress);
}

main();