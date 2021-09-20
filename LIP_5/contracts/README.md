# Kira NFT Staking

## Install dependencies

```
yarn
```

## Environmental variables

```
INFURA_PROJECT_ID=
PRIVATE_KEY=
ETHERSCAN_API_KEY=
```

- `INFURA_PROJECT_ID`: You can signup on infura.io and can get the project id on settings page.
- `PRIVATE_KEY`: Private key of the deployer account
- `ETHERSCAN_API_KEY`: You can signup on etherscan.io and can get the api key. This key will be used to verify the smart contracts on etherscan.

## Smart contracts

### MockKex

We need to deploy MockKex for testing but we don't need it for production. In production, just use the ERC20 KEX token address.

### KiraAccessControl
This is a smart contract which manages the roles of accounts for other smart contracts. There are two roles: `ADMIN` & `MANAGER`. It contains the functions to add/remove roles to account. Deployer is being set as `ADMIN` by default. Only admins can add/remove roles to other accounts.

### KiraNFT

KiraNFT is an ERC1155 NFT smart contract.

`tokenUri`: this is the base url for token metadata of each id.

##### `mint`

Only the owner can mint NFT.

* `address account`: mint NFTs to the address
* `uint256 id`: the token id
* `uint256 amount`: the amount of token

##### `mintBatch`

Only the owner can mint NFT.

* `address account`: mint NFTs to the address
* `uint256[] memory ids`: the token ids
* `uint256[] memory amounts`: the amounts of tokens

##### `addCard`

Only the owner can call `addCard` to set the NFT price and count.

* `uint256 id`: the token id
* `uint24 quantity`: the number of the instance for the token id
* `uint256 amount`: the number of `Crystal` to buy one NFT token for the token id


##### `addCardBatch`

The batch of the `addCard`

##### `setFarmerAddress`

Only the owner can call `setFarmerAddress`. This just updates the farmer (`KexFarm`) contract address for KiraNFT.

##### `buy`

The is a public function that any user can call to buy the NFT with `Crystal`s through the `farmer`. It will decrease the `Crystal`s from user's account on farmer contract. Instead, it mints the NFT to the caller.

* `uint256 id`: the token id
* `uint256 count`: the number of the instance to buy

* IKexFarm farmer

### NFTStaking

Staking ERC1155 and get rewards as ERC20.

##### constructor

* `KiraAccessControl _accessControl`: the AccessControl contract address.

##### `updateAccessControl`

* `KiraAccessControl _accessControl`: only the admin role account can update the AccessControl contract address

##### `addPool`

Only managers (set by AccessControl) can create a pool with the following parameters.

* `uint256 poolId`: the id of a staking pool
* `IERC1155 nftToken`: NFT token contract address (only ERC1155)
* `uint256 nftTokenId`: NFT token id
* `IERC20 rewardToken`: ERC20 reward token address. Users stake their NFTs and will get rewards as this token
* `uint256 rewardPerNFT`: reward amount that user gets when he/she stakes one NFT per 30 days. The reward is calculated based on this parameter and the passed staking time.

##### `addRewards`

Only managers (set by AccessControl) can add reward tokens to staking pools.

* `uint256 poolId`: the id of a staking pool
* `uint256 amount`: the amount of ERC20 reward tokens. This will send the amount of ERC20 tokens from the manager's account to the pool's contract.

##### `withdrawRewards`

Only managers (set by AccessControl) can withdraw reward tokens from staking pools.

* `uint256 poolId`: the id of a staking pool
* `uint256 amount`: the amount of ERC20 reward tokens. This will send the amount of ERC20 tokens from the pool's contract to the manager's account.

##### `stake`

This is a public function that any user can call for staking their NFTs. It transfers the NFT token from user's account to the staking pool.
If the user already staked to this pool, it distributes the current rewards to the user and starts staking from the fresh with the updated NFT token count.

* `uint256 poolId`: the id of a staking pool
* `uint256 count`: the amount of NFT token that user wants to stake. The NFT should be the pool's ERC1155 token & the token id.

##### `unstake`

This is a public function that any user can call for unstaking their NFTs. It transfers the NFT token from the staking pool to the user's account.
It distributes the current rewards to the user and starts staking from the fresh with the updated NFT token count.

* `uint256 poolId`: the id of a staking pool
* `uint256 count`: the amount of NFT token that user wants to unstake. The NFT should be the pool's ERC1155 token & the token id.

##### `claimReward`

This is a public function that any user can call for claiming their staking rewards. It calculates the reward amount based on the passed staking time and the pool's reward speed.

* `uint256 poolId`: the id of a staking pool

The smart contract also contains the view functions to query the current staking pool information.

### KexFarm

This is a smart contract that users can stake their ERC20 token and get `Crystals` which will be used to buy NFTs.

##### `setTokenAddress`

Only the admin can set the ERC20 token address which users will stake.

##### `deposit`

This is a public function that users can call for depositing their ERC20 tokens to stake. It will transfer the ERC20 tokens from the user to the smart contract and update the staking balance for the caller.

* `uint256 amount`: amount of ERC20 token to deposit

##### `withdraw`

This is a public function that users can call for withdrawing their ERC20 tokens to unstake. It will transfer the ERC20 tokens the smart contract to the user and update the staking balance for the caller.

* `uint256 amount`: amount of ERC20 token to withdraw

##### `farmed`

This is a public view function that returns how many KEX has farmed for the certain account

* `address sender`: the account to check the farmed balance

##### `payment`

This is a payment function to buy a NFT using `Crystals` from KiraNFT contract. Only callable from authorized account. We need to add the KiraNFT contract address as authorized.

* `address buyer`: the account to buy NFT using `Crystals`
* `uint256 amount`: `Crystal` amount

##### `rewardedStones`

This is a public function to calculate & update the rewards for an account. The calculation is based on the passed seconds since the last update.

-----

### Deployment guides

##### Deploy MockKex

```sh
npx hardhat run scripts/1_deploy_MockKex.js --network rinkeby
MockKex deployed to: 0xb03a58Df62CD548603685f9E17a337d64AC056E1
```

Verify the contract
```sh
MockKex=0xb03a58Df62CD548603685f9E17a337d64AC056E1
npx hardhat verify --network rinkeby $MockKex "Mock Kex" "MKEX" "100000000000000000000000000"
```

Once deployed, it will mint `100000000 MKEX` on the deployer account for testing purpose.

##### KiraAccessControl

```sh
npx hardhat run scripts/2_deploy_AccessControl.js --network rinkeby
KiraAccessControl deployed to: 0x0c9FCeF7F6272d2c1053839b1069b4b5f884D4E3
```

`scripts/2_deploy_AccessControl.js` also sets a manager role for the deployer address

Verify the contract
```sh
KiraAccessControl=0x0c9FCeF7F6272d2c1053839b1069b4b5f884D4E3
npx hardhat verify --network rinkeby $KiraAccessControl
```

##### NFTStaking

Update the `KiraAccessControl` address inside `scripts/3_deploy_NFTStaking.js` with the above deployed one.

```sh
npx hardhat run scripts/3_deploy_NFTStaking.js --network rinkeby
NFTStaking deployed to: 0x0433c6CB94863850eb3fECE472A482f228F65b2E
```

Verify the contract
```sh
NFTStaking=0x0433c6CB94863850eb3fECE472A482f228F65b2E
npx hardhat verify --network rinkeby $NFTStaking $KiraAccessControl
```

##### KexFarm

Update the `MockKex` address inside `scripts/4_deploy_KexFarm.js` with the above deployed one ($MockKex).

```sh
npx hardhat run scripts/4_deploy_KexFarm.js --network rinkeby
KexFarm deployed to: 0x995179A0ae6Df352d1f49555fd8C8495D8Bb61B1
```

Verify the contract
```sh
KexFarm=0x995179A0ae6Df352d1f49555fd8C8495D8Bb61B1
npx hardhat verify --network rinkeby $KexFarm $MockKex
```

##### KiraNFT

Update the `KexFarm` address inside `scripts/5_deploy_KiraNFT.js` with the above deployed one.

```sh
npx hardhat run scripts/5_deploy_KiraNFT.js --network rinkeby
KiraNFT deployed to: 0xD33269a1eeD3aFBC2a78Ee1c98704580c2AC7Dc1
```

`scripts/5_deploy_KiraNFT.js` also sets the `KexFarm` address for `KiraNFT`

Verify the contract
```sh
KiraNFT=0xD33269a1eeD3aFBC2a78Ee1c98704580c2AC7Dc1
npx hardhat verify --network rinkeby $KiraNFT
```

-----

### Metadata

Metadata is located under `/metadata` directory.

It contains the information (NFT image, description, name, attributes, etc) for each NFT. Currently we have 6 NFTs.

For now, we are uploading to github for NFT images and metadata. We can consider about IPFS for this.

### Testing