const hre = require('hardhat');

async function main() {
  const accessControl = '0x742C6AFd68bB1fe511FB06081443cD08bc542511'; // RINKEBY

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
