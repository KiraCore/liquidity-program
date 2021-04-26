const hre = require('hardhat');
const moment = require('moment');

async function main() {
  const accessControl = ''; // RINKEBY
  const nftTokenAaddress = ''; // RINKEBY
  const distributor = ''; // RINKEBY

  const NFTStaking = await ethers.getContractFactory('NFTStaking');

  const DAY = 3600 * 24;
  const TOKEN_GOLD = 0;

  nftStaking = await NFTStaking.deploy(
    accessControl,
    distributor,
    nftTokenAaddress,
    TOKEN_GOLD,
    50, // Pool Size
    moment().unix(),
    40 * DAY, // Pool Period
    ethers.utils.parseEther('50'), // Reward per NFT
    30 * DAY, // Early Withdrawal
    60 * DAY, // Full Maturity
  );
  await nftStaking.deployed();

  await nftStaking.updatePoolPeriod(100 * DAY);
  //   await nftStaking.addToWhitelist(user.address);

  console.log('NFTStaking deployed to:', nftStaking.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
