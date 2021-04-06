const hre = require('hardhat');

async function main() {
  const accessControl = ''; // RINKEBY
  const tokenAddress = ''; // RINKEBY

  const RewardDistributor = await hre.ethers.getContractFactory('RewardDistributor');
  const rewardDistributor = await RewardDistributor.deploy(tokenAddress, accessControl);

  await rewardDistributor.deployed();

  console.log('RewardDistributor deployed to:', rewardDistributor.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
