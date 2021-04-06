const hre = require('hardhat');

async function main() {
  const MockKex = await hre.ethers.getContractFactory('MockKex');
  const mockKex = await MockKex.deploy('Mock Kex', 'MKEX', hre.ethers.utils.parseEther('100000000'));

  await mockKex.deployed();

  console.log('MockKex deployed to:', mockKex.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
