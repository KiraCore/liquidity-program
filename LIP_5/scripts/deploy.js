const hre = require('hardhat');
const fs = require('fs');
const exec = require('child_process').exec;

const KIRA_TOKEN_ADDRESS = process.env.KIRA_TOKEN_ADDRESS;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function execResolve(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
         console.log('exec error: ' + error);
         throw 'console exec failed'
    }
}

async function main() {  
  // setup factories
  const kexFarm_factory = await hre.ethers.getContractFactory('KexFarm');
  const kiraNFT_factory = await hre.ethers.getContractFactory('KiraNFT');
  const nftStaking_factory = await hre.ethers.getContractFactory('NFTStaking');
  // ------------------------------------------------------------------

  const kexFarm = await kexFarm_factory.deploy(KIRA_TOKEN_ADDRESS);
  await kexFarm.deployed();
  const NFT_FARM_ADDRESS = kexFarm.address;

  console.log('KexFarm deployed to:', NFT_FARM_ADDRESS, ' and connected with the token address: ', KIRA_TOKEN_ADDRESS);
  console.log('Waiting 15s for blockchain to catch up...')
  await sleep(15000);
  console.log("Veryfying KexFarm contract...")
  exec("echo \"$PWD\" && npx hardhat verify --network kovan " + NFT_FARM_ADDRESS + " " + KIRA_TOKEN_ADDRESS, execResolve)
  console.log("Finished KexFarm contract verification.")
  // ------------------------------------------------------------------

  const kiraNFT = await kiraNFT_factory.deploy();
  await kiraNFT.deployed();
  const NFT_MINTING_ADDRESS = kiraNFT.address

  await kiraNFT.setFarmerAddress(NFT_FARM_ADDRESS);
  await kexFarm.setMinterAddress(NFT_MINTING_ADDRESS)

  console.log('KiraNFT minting deployed to: ', NFT_MINTING_ADDRESS, ' and connected with the stone farming: ', NFT_FARM_ADDRESS);
  console.log('Waiting 15s for blockchain to catch up...')
  await sleep(15000);
  console.log("Veryfying KiraNFT contract...")
  exec("echo \"$PWD\" && npx hardhat verify --network kovan " + NFT_MINTING_ADDRESS, execResolve)
  console.log("Finished KiraNFT contract verification.")
  // ------------------------------------------------------------------

  const nftStaking = await nftStaking_factory.deploy(KIRA_TOKEN_ADDRESS, NFT_MINTING_ADDRESS);
  await nftStaking.deployed();
  const NFT_STAKING_ADDRESS = nftStaking.address;

  console.log('NFTStaking deployed to: ', NFT_STAKING_ADDRESS, ' and connected with the token address: ', KIRA_TOKEN_ADDRESS);
  console.log('Waiting 15s for blockchain to catch up...')
  await sleep(15000);
  console.log("Veryfying NFTStaking contract...")
  exec("echo \"$PWD\" && npx hardhat verify --network kovan " + NFT_STAKING_ADDRESS + " " + KIRA_TOKEN_ADDRESS + " " + NFT_MINTING_ADDRESS, execResolve)
  console.log("Finished NFTStaking contract verification.")
  // ------------------------------------------------------------------

  // Save resutls
  fs.writeFileSync("result.txt", 
  "KIRA_TOKEN_ADDRESS=" + KIRA_TOKEN_ADDRESS + "\n" +
  "NFT_FARM_ADDRESS=" + NFT_FARM_ADDRESS + "\n" +
  "NFT_MINTING_ADDRESS=" + NFT_MINTING_ADDRESS + "\n" +
  "NFT_STAKING_ADDRESS=" + NFT_STAKING_ADDRESS)

  // Print results
  console.log("--- SUCCES, ALL CONTRACTS DEPLOYED ---")
  console.log("KIRA_TOKEN_ADDRESS:", KIRA_TOKEN_ADDRESS)
  console.log("NFT_FARM_ADDRESS: ", NFT_FARM_ADDRESS)
  console.log("NFT_MINTING_ADDRESS: ", NFT_MINTING_ADDRESS)
  console.log("NFT_STAKING_ADDRESS: ", NFT_STAKING_ADDRESS)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
