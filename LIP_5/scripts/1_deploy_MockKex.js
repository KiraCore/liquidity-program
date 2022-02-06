const hre = require('hardhat');

async function main() {
  const MockKex = await hre.ethers.getContractFactory('MockKex');
  const mockKex = await MockKex.deploy('KIRA Network', 'KEX', hre.ethers.utils.parseEther('300000000'));

  await mockKex.deployed();

  console.log('Test KEX deployed to:', mockKex.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
