const hre = require('hardhat');
const KIRA_TOKEN_ADDRESS = process.env.KIRA_TOKEN_ADDRESS;

async function main() {  
  const KexFarm = await hre.ethers.getContractFactory('KexFarm');
  const kexFarm = await KexFarm.deploy(KIRA_TOKEN_ADDRESS); // TODO

  await kexFarm.deployed();

  console.log('KexFarm deployed to:', kexFarm.address, ' and connected with the token address: ', KIRA_TOKEN_ADDRESS);

  var txtFile = new File("result.txt");
  txtFile.write(kexFarm.address);
  txtFile.close();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
