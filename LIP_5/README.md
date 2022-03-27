# Kira NFT Staking

LIP_5 is a collection of smart contracts for KEX staking & KIRA NFT farming.

## Install dependencies

Before you begin, check Common Guide's [Dependency Setup Section](../setup.md#1.-Dependency-Setup)

```
yarn
```

## Environmental variables

```
INFURA_PROJECT_ID=
PRIVATE_KEY=
ETHERSCAN_API_KEY=
NFT_STAKING_ADDRESS=
```

- `INFURA_PROJECT_ID`: You can signup on infura.io and can get the project id on settings page.
- `PRIVATE_KEY`: Private key of the deployer account
- `ETHERSCAN_API_KEY`: You can signup on etherscan.io and can get the api key. This key will be used to verify the smart contracts on etherscan.
- `NFT_STAKING_ADDRESS`: Smart contract which allows to earn KEX ERC20, for staking KIRA NFT tokens

## Smart contracts

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

There is a public function that any user can call to buy the NFT with `Krystal`s through the `farmer`. It will decrease the `Krystal`s from user's account on farmer contract. Instead, it mints the NFT to the caller.

* `uint256 id`: the token id
* `uint256 count`: the number of the instance to buy

### NFTStaking

Staking ERC1155 and get rewards as ERC20.

##### `addPool`

Only owner can create a pool with the following parameters.

* `uint256 poolId`: the id of a staking pool
* `IERC1155 nftToken`: NFT token contract address (only ERC1155)
* `uint256 nftTokenId`: NFT token id
* `IERC20 rewardToken`: ERC20 reward token address. Users stake their NFTs and will get rewards as this token
* `uint256 rewardPerNFT`: reward amount that user gets when he/she stakes one NFT per 30 days. The reward is calculated based on this parameter and the passed staking time.

##### `addRewards`

Only owner can add reward tokens to staking pools.

* `uint256 poolId`: the id of a staking pool
* `uint256 amount`: the amount of ERC20 reward tokens. This will send the amount of ERC20 tokens from the manager's account to the pool's contract.

##### `withdrawRewards`

Only owner can withdraw reward tokens from staking pools.

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

This is a smart contract that users can stake their ERC20 token and get `Krystals` which will be used to buy NFTs.

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

This is a payment function to buy a NFT using `Krystals` from KiraNFT contract. Only callable from authorized account. We need to add the KiraNFT contract address as authorized by calling `setMinterAddress` and thus set _minter variable to KiraNFT address.

* `address buyer`: the account to buy NFT using `Krystals`
* `uint256 amount`: `Krystal` amount

##### `rewardedStones`

This is a public function to calculate & update the rewards for an account. The calculation is based on the passed seconds since the last update.

-----

### Deployment guides

##### Define LIP_1 KEX Contract Address

```sh
# KEX on KOVAN: 0x539fa9544ea8f82a701b6d3c6a6f0e2ebe307ea6
# KEX on ROPSTEN: 0x2CDA738623354c93eB974F3C90175F249d611CA4
# KEX on MAINNET: 0x16980b3B4a3f9D89E33311B5aa8f80303E5ca4F8

# Save KIRA_TOKEN_ADDRESS as env variable
echo "KIRA_TOKEN_ADDRESS=0x2CDA738623354c93eB974F3C90175F249d611CA4" >> ./.env && \
 . ./.env
```

##### Deploy & Verify KexFarm Contract

```sh
# Requires `KIRA_TOKEN_ADDRESS` set in env variables
npx hardhat run scripts/1_deploy_KexFarm.js --network kovan 
# KexFarm on ROPSTEN: 0x334F7e7C7aBB0A314a9750d8CA076A3561B71432
# KexFarm on MAINNET: TBD

# Save NFT_FARM_ADDRESS as env variable
echo "NFT_FARM_ADDRESS=0xe89841b13b7e23e560D5f1FdD8591BDE466d68c4" >> ./.env

# verify NFT farming contract
. ./.env && npx hardhat verify --network kovan $NFT_FARM_ADDRESS $KIRA_TOKEN_ADDRESS
```

##### Deploy & Verify KiraNFT Mint Contract

```sh
# Requires `NFT_FARM_ADDRESS` set in env variables
# The setFarm address funciton is trigerred automatically
npx hardhat run scripts/2_deploy_KiraNFT.js --network kovan
# KiraNFT on ROPSTEN: 0x07D87E94AE77b50A3FB3E9F1983E39d69cA50F6C
# KiraNFT on MAINNET: TBD

# Save NFT_MINTING_ADDRESS as env variable
echo "NFT_MINTING_ADDRESS=0x8D7A7162271f7a124d9BBd305B18deDaEeC5721C" >> ./.env

# Verify NFT minting contract
. ./.env && npx hardhat verify --network kovan $NFT_MINTING_ADDRESS
```

##### Deploy & Verify NFTStaking Contract

```sh
npx hardhat run scripts/3_deploy_NFTStaking.js --network kovan
# NFTStaking on ROPSTEN: 0x7e4326fC1B72c3B04485dA3b4E63389aC14AE6Fa
# NFTStaking on MAINNET: TBD

# Save NFT_STAKING_ADDRESS as env variable
echo "NFT_STAKING_ADDRESS=0x7e4326fC1B72c3B04485dA3b4E63389aC14AE6Fa" >> ./.env

# verify NFT staking contract
. ./.env && npx hardhat verify --network kovan $NFT_STAKING_ADDRESS $KIRA_TOKEN_ADDRESS $NFT_MINTING_ADDRESS
```

### Quick Deploy

This is a quick & dirty one-line bash command enabling deployment of all contracts at once. At the end of execution a list of all created contracts is displayed. Only `NETWORK`, `KIRA_TOKEN_ADDRESS`, `PRIVATE_KEY`, `ETHERSCAN_API_KEY` and `INFURA_PROJECT_ID` must be specified before the script is tarted.

```sh
NETWORK="ropsten" && \
KIRA_TOKEN_ADDRESS="0x2CDA738623354c93eB974F3C90175F249d611CA4" && \
PRIVATE_KEY="XXX...XXX" && \
ETHERSCAN_API_KEY="XXX...XXX" && \
INFURA_PROJECT_ID="XXX...XXX" && \
 echo "Cloning smartcontracts repo..." && cd $HOME && rm -fvr ./liquidity-program && \
 git clone https://github.com/KiraCore/liquidity-program.git -b LIP_5 && \
 cd ./liquidity-program/LIP_5 && touch ./.env && chmod 777 ./.env && yarn && \
 echo "PRIVATE_KEY=$PRIVATE_KEY" >> ./.env && \
 echo "ETHERSCAN_API_KEY=$ETHERSCAN_API_KEY" >> ./.env && \
 echo "INFURA_PROJECT_ID=$INFURA_PROJECT_ID" >> ./.env &&  \
 echo "KIRA_TOKEN_ADDRESS=$KIRA_TOKEN_ADDRESS" >> ./.env && \
 echo "Deploying 1_deploy_KexFarm.js => " && RESULT_FILE=./result.txt && \
 rm -fv $RESULT_FILE && npx hardhat run scripts/1_deploy_KexFarm.js --network $NETWORK && \
 NFT_FARM_ADDRESS=$(cat $RESULT_FILE) && echo "NFT_FARM_ADDRESS=$NFT_FARM_ADDRESS" >> ./.env && \
 echo "Veryfying 1_deploy_KexFarm.js => " && sleep 180 && \
 ( npx hardhat verify --network $NETWORK $NFT_FARM_ADDRESS $KIRA_TOKEN_ADDRESS || echo "Already verified" ) && \
 echo "Started 2_deploy_KiraNFT.js => " && \
 rm -fv $RESULT_FILE && npx hardhat run scripts/2_deploy_KiraNFT.js --network $NETWORK && \
 NFT_MINTING_ADDRESS=$(cat $RESULT_FILE) && echo "NFT_MINTING_ADDRESS=$NFT_MINTING_ADDRESS" >> ./.env && \
 echo "Veryfying 2_deploy_KiraNFT.js => " && sleep 180 && \
 ( npx hardhat verify --network $NETWORK $NFT_MINTING_ADDRESS || echo "Already verified" ) && \
 echo "Deploying 3_deploy_NFTStaking.js => " && RESULT_FILE="./result.txt" && \
 rm -fv $RESULT_FILE && npx hardhat run scripts/3_deploy_NFTStaking.js --network $NETWORK && \
 NFT_STAKING_ADDRESS=$(cat $RESULT_FILE) && echo "NFT_STAKING_ADDRESS=$NFT_STAKING_ADDRESS" >> ./.env && \
 echo "Veryfying 3_deploy_NFTStaking.js => " && sleep 180 && \
 ( npx hardhat verify --network $NETWORK $NFT_STAKING_ADDRESS $KIRA_TOKEN_ADDRESS $NFT_MINTING_ADDRESS || echo "Already verified" ) && \
 rm -fv $RESULT_FILE && cat ./.env && echo "Deployment Suceeded !!!" || echo "Deployment Failed :("
 
```


### Quickly Deploy (alternative)

```sh
NETWORK="ropsten" && \
KIRA_TOKEN_ADDRESS="0x2CDA738623354c93eB974F3C90175F249d611CA4" && \
PRIVATE_KEY="XXX...XXX" && \
ETHERSCAN_API_KEY="XXX...XXX" && \
INFURA_PROJECT_ID="XXX...XXX" && \
 echo "Cloning smartcontracts repo..." && cd $HOME && rm -fvr ./liquidity-program && \
 git clone https://github.com/KiraCore/liquidity-program.git -b LIP_5 && \
 cd ./liquidity-program/LIP_5 && touch ./.env && chmod 777 ./.env && yarn && \
 echo "PRIVATE_KEY=$PRIVATE_KEY" >> ./.env && \
 echo "ETHERSCAN_API_KEY=$ETHERSCAN_API_KEY" >> ./.env && \
 echo "INFURA_PROJECT_ID=$INFURA_PROJECT_ID" >> ./.env &&  \
 echo "KIRA_TOKEN_ADDRESS=$KIRA_TOKEN_ADDRESS" >> ./.env && \
 echo "Deploying all contracts... => " && RESULT_FILE=./tesult.txt && \
 rm -fv $RESULT_FILE && npx hardhat run scripts/deploy.js --network $NETWORK
```


## Metadata

Metadata is located under `/metadata-<network>` directory. The metadata standards used can be found [here](https://docs.opensea.io/docs/metadata-standards)

It contains the information (NFT image, description, name, attributes, etc) for each NFT. Currently we have 14 NFTs.

Available `trait_types` attributes and the corresponding possible `values`:

* `ID` - `<number>`
* `Tier` - `Common`, `Uncommon`, `Rare`
* `Camp` - `BOSE`, `KIRA`, `COSMOS`, `POLKADOT`, `BINANCE`, `ETHEREUM`
* `Type` - `Hacker`, `Mage`, `Cyborg`, `Human`, `Übermensch`, `OG`, `Shinigami`
* `Gender` - `Male`, `Female`

The `LIP_5\contracts\KiraNFT.sol` must be updated every time to contain a correct `tokenUri` referencing a **folder** in IPFS. It is also possible to call the contract using `setTokenURI` function and update the metadata if needed.

* KOVAN METADATA: `ipfs://QmRT4JjEUrRqQwC16AP7UVDqe1NpH2FCNEk5X2AezzHj5M/`
* MAINNET METADATA: `TBD`

## Testing

### Add NFT Card Information

For each NFT call `NFT_MINTING_ADDRESS` - `KiraNFT`'s `addCard` function and create cards as per the table defined below:

- `id` - the NFT identifier as per metadata index (`id`)
- `count` - the number of NFT's to exit (`quantity`)
- `price` - a number of `Kristals` needed to acquire a token (`amount`)

The krystals are non divisable and their issuance is fixed at `1 krystal` per `1 KEX` per `24 hours`. The maximum amount that can be staked by individual is fixed to `10'000` KEX. Effectively the maximum number of krystals that can be created every day is `10'000`.

| id | name     | count | price  |
|----|----------|-------|--------|
|  1 | Samael   | 10    | 10000  |
|  2 | Mikhaela | 10    | 20000  |
|  3 | Kali     | 10    | 20000  |
|  4 | Lucy     | 10    | 20000  |
|  5 | Maalik   | 10    | 10000  |
|  6 | Azrael   | 10    | 20000  |
| | | | |
|  7 | CZ       | 6     | 70000  |
|  8 | Bose     | 6     | 70000  |
|  9 | Jae      | 6     | 70000  |
| 10 | Vitalik  | 6     | 70000  |
| 11 | Gavin    | 6     | 70000  |
| | | | |
| 12 | Asmodat  | 3     | 140000 |
| 13 | KIRA     | 3     | 280000 |
| 14 | Lilith   | 3     | 560000 |

#### Get NFTs

There are two ways to get NFTs.

- With a deployer account, we can mint NFTs to any accounts for testing purpose.
- We can use KexFarm. To do this, we can send the KEX tokens to a testing user and then farm Crystals from KEX. After getting some Crystals, we can buy NFTs.

##### Add pools (ERC1155 vs ERC20 pair) to NFTStaking

To be able to stake KiraNFT to get KEX tokens, we need to add pools for each KiraNFT. Currently we have `n` NFT's, so need to add minimum of `n` pools to NFTStaking. 

When pools are created they are auto-enumerated starting from 0, 1, 2 ... and bounded to a specific KEX token address (`KIRA_TOKEN_ADDRESS`) and NFT minting address (`NFT_MINTING_ADDRESS`).

Check `NFTStaking`'s `addPool` function in the above.

* nftTokenId - ID of the token that will be accepted as stakeable
* rewardPerNFT - Amount of KEX to reward to the staker
