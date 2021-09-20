const hre = require('hardhat');

async function main() {
  const kexFarmAddr = '0x995179A0ae6Df352d1f49555fd8C8495D8Bb61B1';

  const KiraNFT = await hre.ethers.getContractFactory('KiraNFT');
  const kiraNFT = await KiraNFT.deploy();

  await kiraNFT.deployed();

  await kiraNFT.setFarmerAddress(kexFarmAddr);

  console.log('KiraNFT deployed to:', kiraNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
