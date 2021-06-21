const hre = require('hardhat');

async function main() {
  const tokenAddress = '0xDacd486ca05d47d745E81F31E296Ce299fe35236'; // RINKEBY

  const KexFarm = await hre.ethers.getContractFactory('KexFarm');
  const kexFarm = await KexFarm.deploy(tokenAddress); // TODO

  await kexFarm.deployed();

  console.log('KexFarm deployed to:', kexFarm.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
