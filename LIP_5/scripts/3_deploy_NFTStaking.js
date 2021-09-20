const hre = require('hardhat');

async function main() {
  const accessControl = '0x0c9FCeF7F6272d2c1053839b1069b4b5f884D4E3'; // RINKEBY

  const NFTStaking = await hre.ethers.getContractFactory('NFTStaking');

  nftStaking = await NFTStaking.deploy(accessControl);
  await nftStaking.deployed();

  console.log('NFTStaking deployed to:', nftStaking.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
