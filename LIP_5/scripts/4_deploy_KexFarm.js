const hre = require('hardhat');

async function main() {
  const tokenAddress = '0xb03a58Df62CD548603685f9E17a337d64AC056E1'; // RINKEBY

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
