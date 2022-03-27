const hre = require('hardhat');
const fs = require('fs');
const exec = require('child_process').exec;

const envFile = ".env"
const KIRA_TOKEN_ADDRESS = process.env.KIRA_TOKEN_ADDRESS;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function execResolve(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
        console.log('exec error: ' + error);
        if (!String(error).includes("Reason: Already Verified")) {
            throw 'console exec failed'
        } else {
            console.log("Already verified, setup can continue...")
        }
    }
}

async function main() {  
  console.log("deploy.js => main()")
  const KexFarm = await hre.ethers.getContractFactory('KexFarm');
  const kexFarm = await KexFarm.deploy(KIRA_TOKEN_ADDRESS);
  await kexFarm.deployed();
  const NFT_FARM_ADDRESS = kexFarm.address;
  fs.appendFileSync(envFile, "\nNFT_FARM_ADDRESS="+NFT_FARM_ADDRESS);

  console.log('KexFarm deployed to:', NFT_FARM_ADDRESS, ' and connected with the token address: ', KIRA_TOKEN_ADDRESS);
  console.log('Waiting 15s for blockchain to catch up...')
  await sleep(15000);
  console.log("Veryfying KexFarm contract...")
  exec("echo \"$PWD\" && . ./.env && npx hardhat verify --network $NETWORK $NFT_FARM_ADDRESS $KIRA_TOKEN_ADDRESS", execResolve)
  console.log("Finished KexFarm contract verification.")
  // ------------------------------------------------------------------

  const KiraNFT = await hre.ethers.getContractFactory('KiraNFT');
  const kiraNFT = await KiraNFT.deploy();
  await kiraNFT.deployed();
  const NFT_MINTING_ADDRESS = kiraNFT.address
  fs.appendFileSync(envFile, "NFT_MINTING_ADDRESS="+NFT_MINTING_ADDRESS);

  await kiraNFT.setFarmerAddress(NFT_FARM_ADDRESS);
  await kexFarm.setMinterAddress(NFT_MINTING_ADDRESS)

  console.log('KiraNFT minting deployed to: ', NFT_MINTING_ADDRESS, ' and connected with the stone farming: ', NFT_FARM_ADDRESS);
  console.log('Waiting 15s for blockchain to catch up...')
  await sleep(15000);
  console.log("Veryfying KiraNFT contract...")
  exec("echo \"$PWD\" && . ./.env && npx hardhat verify --network $NETWORK $NFT_MINTING_ADDRESS", execResolve)
  console.log("Finished KiraNFT contract verification.")
  // ------------------------------------------------------------------

  const NFTStaking = await hre.ethers.getContractFactory('NFTStaking');
  const nftStaking = await NFTStaking.deploy(KIRA_TOKEN_ADDRESS, NFT_MINTING_ADDRESS);
  await nftStaking.deployed();
  const NFT_STAKING_ADDRESS = nftStaking.address;
  fs.appendFileSync(envFile, "NFT_STAKING_ADDRESS="+NFT_STAKING_ADDRESS);

  console.log('NFTStaking deployed to: ', NFT_STAKING_ADDRESS, ' and connected with the token address: ', KIRA_TOKEN_ADDRESS);
  console.log('Waiting 15s for blockchain to catch up...')
  await sleep(15000);
  console.log("Veryfying NFTStaking contract...")
  exec("echo \"$PWD\" && . ./.env && npx hardhat verify --network $NETWORK $NFT_STAKING_ADDRESS $KIRA_TOKEN_ADDRESS $NFT_MINTING_ADDRESS", execResolve)
  console.log("Finished NFTStaking contract verification.")
  // ------------------------------------------------------------------

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
