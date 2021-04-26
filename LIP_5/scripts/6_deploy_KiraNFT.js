const hre = require('hardhat');

async function main() {
  const kexFarmAddr = '0xc024Fd37C136026df0aAD9EA2178AA81566fE097';

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
