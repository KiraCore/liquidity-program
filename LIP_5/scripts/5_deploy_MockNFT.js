const hre = require('hardhat');

async function main() {
  const MockNFT1155 = await hre.ethers.getContractFactory('MockNFT1155');
  const mockNFT1155 = await MockNFT1155.deploy();

  await mockNFT1155.deployed();

  console.log('MockNFT1155 deployed to:', mockNFT1155.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
