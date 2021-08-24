# LIP_5

LIP_5 is a collection of smart contracts for KIRA NFT and Staking.

## Installation

Use the package manager [yarn](https://yarnpkg.com/) to install packages.

```bash
yarn install
```

## Environment

```bash
PRIVATE_KEY=XXXX
INFURA_PROJECT_ID=XXXX
ETHERSCAN_API_KEY=XXXX
```

## Deploy

Use hardhat and deployments scripts in `scripts` folder. (Don't use `scripts/1_deploy_MockKex.js` if you're deploying on the mainnet. Instead use your Kex token address for other scripts)

- Deploy Token

```bash
npx hardhat run scripts/1_deploy_MockKex.js
```

- Deploy Access Control

```bash
npx hardhat run scripts/2_deploy_AccessControl.js
```

- Deploy NFT Staking

```bash
npx hardhat run scripts/3_deploy_NFTStaking.js
```

- Deploy Kex Farm

```bash
npx hardhat run scripts/4_deploy_KexFarm.js
```

- Deploy Kira NFT

```bash
npx hardhat run scripts/5_deploy_KiraNFT.js
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
