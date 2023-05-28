const { ethers, upgrades } = require('hardhat');

// TO DO: Place the address of your proxy here!
const proxyAddress = '0x76Ed8814b96F5480a872F22967f28F3058082038';

async function main() {
  const LeavingATip = await ethers.getContractFactory('LeavingATip');
  const upgraded = await upgrades.upgradeProxy(proxyAddress, LeavingATip);

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );

  //console.log("The current contract owner is: " + upgraded.owner());
  console.log("The current contract owner is: " + upgraded.address);
  console.log('Implementation contract address: ' + implementationAddress);
}

main();
