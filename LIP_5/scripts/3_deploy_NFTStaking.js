const hre = require('hardhat');
const fs = require('fs');

const ACCESS_CONTROL_ADDRESS = process.env.ACCESS_CONTROL_ADDRESS;

async function main() {
  const NFTStaking = await hre.ethers.getContractFactory('NFTStaking');

  nftStaking = await NFTStaking.deploy(ACCESS_CONTROL_ADDRESS);
  await nftStaking.deployed();

  console.log('NFTStaking deployed to: ', nftStaking.address, ', by access control address: ', ACCESS_CONTROL_ADDRESS);

  fs.writeFileSync("result.txt", nftStaking.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
