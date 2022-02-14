const hre = require('hardhat');
const fs = require('fs');

const NFT_FARM_ADDRESS = process.env.NFT_FARM_ADDRESS;

async function main() {
  const KiraNFT = await hre.ethers.getContractFactory('KiraNFT');
  const kiraNFT = await KiraNFT.deploy();

  await kiraNFT.deployed();
  await kiraNFT.setFarmerAddress(NFT_FARM_ADDRESS);

  console.log('KiraNFT minting deployed to: ', kiraNFT.address, ' and connected with the stone farming: ', NFT_FARM_ADDRESS);

  fs.writeFileSync("result.txt", kiraNFT.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
