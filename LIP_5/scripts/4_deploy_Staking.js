const hre = require('hardhat');
const moment = require('moment');

async function main() {
  const accessControl = ''; // RINKEBY
  const tokenAddress = ''; // RINKEBY
  const distributor = ''; // RINKEBY

  const KexStaking = await hre.ethers.getContractFactory('KexStaking');
  const kexStaking = await KexStaking.deploy(accessControl, distributor, tokenAddress, moment().unix(), 40); // TODO

  await kexStaking.deployed();

  await kexStaking.updateEarlyWithdrawal(5 * 60); // FOR TESTING
  await kexStaking.updatePoolPeriod(3600 * 10 * 24); // FOR TESTING

  console.log('kexStaking deployed to:', kexStaking.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
