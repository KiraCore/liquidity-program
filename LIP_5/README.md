# Kira NFT Staking

LIP_5 is a collection of smart contracts for KEX staking & KIRA NFT farming.

## Install dependencies

Before you begin, check Common Guide's [Dependency Setup Section](../setup.md#1.-Dependency-Setup)

## Environmental variables

Ensure following environmental variables are present in the `./.env` file

```
INFURA_PROJECT_ID=
PRIVATE_KEY=
ETHERSCAN_API_KEY=
```

- `INFURA_PROJECT_ID`: You can signup on infura.io and can get the project id on settings page.
- `PRIVATE_KEY`: Private key of the deployer account
- `ETHERSCAN_API_KEY`: You can signup on etherscan.io and can get the api key. This key will be used to verify the smart contracts on etherscan.

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
# NFTStaking on ROPSTEN: 0x957d19C8Cd394cB8ff42FD001434f0294501D1e7
# NFTStaking on MAINNET: TBD

# Save NFT_STAKING_ADDRESS as env variable
echo "NFT_STAKING_ADDRESS=0x957d19C8Cd394cB8ff42FD001434f0294501D1e7" >> ./.env

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
 echo "Deploying 1_deploy_KexFarm.js => " && RESULT_FILE=./result.tmp && \
 rm -fv $RESULT_FILE && npx hardhat run scripts/1_deploy_KexFarm.js --network $NETWORK && \
 NFT_FARM_ADDRESS=$(cat $RESULT_FILE) && echo "NFT_FARM_ADDRESS=$NFT_FARM_ADDRESS" >> ./.env && \
 echo "Veryfying 1_deploy_KexFarm.js => " && sleep 180 && \
 ( npx hardhat verify --network $NETWORK $NFT_FARM_ADDRESS $KIRA_TOKEN_ADDRESS || echo "Already verified" ) && \
 echo "Started 2_deploy_KiraNFT.js => " && \
 rm -fv $RESULT_FILE && npx hardhat run scripts/2_deploy_KiraNFT.js --network $NETWORK && \
 NFT_MINTING_ADDRESS=$(cat $RESULT_FILE) && echo "NFT_MINTING_ADDRESS=$NFT_MINTING_ADDRESS" >> ./.env && \
 echo "Veryfying 2_deploy_KiraNFT.js => " && sleep 180 && \
 ( npx hardhat verify --network $NETWORK $NFT_MINTING_ADDRESS || echo "Already verified" ) && \
 echo "Deploying 3_deploy_NFTStaking.js => " && \
 rm -fv $RESULT_FILE && npx hardhat run scripts/3_deploy_NFTStaking.js --network $NETWORK && \
 NFT_STAKING_ADDRESS=$(cat $RESULT_FILE) && echo "NFT_STAKING_ADDRESS=$NFT_STAKING_ADDRESS" >> ./.env && \
 echo "Veryfying 3_deploy_NFTStaking.js => " && sleep 180 && \
 ( npx hardhat verify --network $NETWORK $NFT_STAKING_ADDRESS $KIRA_TOKEN_ADDRESS $NFT_MINTING_ADDRESS || echo "Already verified" ) && \
 rm -fv $RESULT_FILE && cat ./.env && echo "Deployment Suceeded !!!" || echo "Deployment Failed :("
 
```

-----

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

The Krystals are non divisable and their issuance is fixed at `1 krystal` per `1 KEX` per `24 hours`. The maximum amount that can be staked by individual is fixed to `10'000` KEX. Effectively the maximum number of Krystals that can be created every day is `10'000`.

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

### Get NFTs

There are two ways to get NFTs.

- With a deployer account, we can mint NFTs to any accounts for testing purpose.
- We can use KexFarm. To do this, we far Krystals from staking KEX. After getting some Krystals, we can buy NFTs.

### Add Pools

To be able to stake `KiraNFT` token to get `KEX` tokens, we need to add pools for each `KiraNFT`. Currently we have `n` NFT's, so need to add minimum of `n` pools to NFTStaking. 

When pools are created they are auto-enumerated starting from 0, 1, 2 ... and bounded to a specific KEX token address (`KIRA_TOKEN_ADDRESS`) and NFT minting address (`NFT_MINTING_ADDRESS`).

Check `NFTStaking`'s `addPool` function in the above.

* `_nftTokenId` - ID of the token that will be accepted as stake
* `_rewardPerNFT` - Amount of KEX to reward to the staker per each staked NFT over time period of `rewardPeriod`
* `_rewardPeriod` - Time period in seconds over which amount of `_rewardPerNFT` is distributed
* `_maxPerClaim` - Maximum amount of KEX stakers can claim each time they trigger claim function

### Add Funds to Pool

Once staking pools are created we need to add funds to individual pool's and inform the contract about how much tokens each one of those pools can distribute to NFT stakers.

First we need to transfer ERC20 KEX directly into the `NFT_STAKING_ADDRESS` contract. We can then trigger the `notifyRewards` function:

* `_poolId` - Pool identifier to which reward coins should be added
* `_amount` - Amount of KEX to add to the pool from the still available balance

