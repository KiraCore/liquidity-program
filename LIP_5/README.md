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
# KexFarm on ROPSTEN: 0xa97e2425DE402e55CC230bCa330E02A7Ae0051c4
# KexFarm on KOVAN: 0x7Eb825Ac87E575dBaCda6568F6DB5401122c596d
# KexFarm on MAINNET: TBD

# Save NFT_FARM_ADDRESS as env variable
echo "NFT_FARM_ADDRESS=0xa97e2425DE402e55CC230bCa330E02A7Ae0051c4" >> ./.env

# verify NFT farming contract
. ./.env && npx hardhat verify --network kovan $NFT_FARM_ADDRESS $KIRA_TOKEN_ADDRESS
```

##### Deploy & Verify KiraNFT Mint Contract

```sh
# Requires `NFT_FARM_ADDRESS` set in env variables
# The setFarm address funciton is trigerred automatically
npx hardhat run scripts/2_deploy_KiraNFT.js --network kovan
# KiraNFT on ROPSTEN: 0xad81b3ab9439b71b3F0BD1EA2bBbF5e9D086d0C1
# KiraNFT on KOVAN: 0x265bAF84E0ebE8D0B4e40eB7d7A68baefD3939E3
# KiraNFT on MAINNET: TBD

# Save NFT_MINTING_ADDRESS as env variable
echo "NFT_MINTING_ADDRESS=0xad81b3ab9439b71b3F0BD1EA2bBbF5e9D086d0C1" >> ./.env

# Verify NFT minting contract
. ./.env && npx hardhat verify --network kovan $NFT_MINTING_ADDRESS

# IMPORTANT:
# Open Etherscan and call KexFarm contracts setMinterAddress function and provide NFT_MINTING_ADDRESS as param
```

##### Deploy & Verify NFTStaking Contract

```sh
npx hardhat run scripts/3_deploy_NFTStaking.js --network kovan
# NFTStaking on ROPSTEN: 0xe89841b13b7e23e560D5f1FdD8591BDE466d68c4
# NFTStaking on KOVAN: 0x55201A61Feb6072936f0955dDA589f38325f25fF
# NFTStaking on MAINNET: TBD

# Save NFT_STAKING_ADDRESS as env variable
echo "NFT_STAKING_ADDRESS=0xe89841b13b7e23e560D5f1FdD8591BDE466d68c4" >> ./.env

# verify NFT staking contract
. ./.env && npx hardhat verify --network kovan $NFT_STAKING_ADDRESS $KIRA_TOKEN_ADDRESS $NFT_MINTING_ADDRESS
```

### Quick Deploy

This is a quick & dirty one-line bash command enabling deployment of all contracts at once. At the end of execution a list of all created contracts is displayed. Only `NETWORK`, `KIRA_TOKEN_ADDRESS`, `PRIVATE_KEY`, `ETHERSCAN_API_KEY` and `INFURA_PROJECT_ID` must be specified before the script is started.

```sh
# ensure that you run node v16 LTS
npm install -g n 
n 16.14.1

NETWORK="ropsten" && \
 BRANCH="bugfix/LIP_5-audit-v3" && \
 KIRA_TOKEN_ADDRESS="0x2CDA738623354c93eB974F3C90175F249d611CA4" && \
 [ -z "$PRIVATE_KEY" ] && PRIVATE_KEY="XXX" && \
 [ -z "$ETHERSCAN_API_KEY" ] && ETHERSCAN_API_KEY="XXX" && \
 [ -z "$INFURA_PROJECT_ID" ] && INFURA_PROJECT_ID="XXX" && \
 echo "Cloning smartcontracts repo..." && cd $HOME && rm -fvr ./liquidity-program && \
 git clone https://github.com/KiraCore/liquidity-program.git -b "$BRANCH" && \
 cd ./liquidity-program/LIP_5 && touch ./.env && chmod 777 ./.env && yarn && \
 echo "NETWORK=$NETWORK" >> ./.env && \
 echo "KIRA_TOKEN_ADDRESS=$KIRA_TOKEN_ADDRESS" >> ./.env && \
 echo "PRIVATE_KEY=$PRIVATE_KEY" >> ./.env && \
 echo "ETHERSCAN_API_KEY=$ETHERSCAN_API_KEY" >> ./.env && \
 echo "INFURA_PROJECT_ID=$INFURA_PROJECT_ID" >> ./.env && \
 npx hardhat run scripts/deploy.js --network $NETWORK
```

# Testing

## Create Metadata

Metadata is located under `/metadata-<network>` directory. The metadata standards used can be found [here](https://docs.opensea.io/docs/metadata-standards)

It contains the information (NFT image, description, name, attributes, etc) for each NFT. Currently we have 14 NFTs.

Available `trait_types` attributes and the corresponding possible `values`:

* `ID` - `<number>`
* `Tier` - `Common`, `Uncommon`, `Rare`
* `Camp` - `BOSE`, `KIRA`, `COSMOS`, `POLKADOT`, `BINANCE`, `ETHEREUM`
* `Type` - `Hacker`, `Mage`, `Cyborg`, `Human`, `Übermensch`, `OG`, `Shinigami`
* `Gender` - `Male`, `Female`

The `LIP_5\contracts\KiraNFT.sol` must be updated every time to contain a correct `tokenUri` referencing a **folder** in IPFS. It is also possible to call the contract using `setTokenURI` function and update the metadata if needed. 

NOTE: When metadata is uploaded it must be accessible as a folder, where each individual NFT metadata is a file with an iterative name 1, 2, 3... which will also act as the NFT identifier later on.

* KOVAN METADATA: `ipfs://QmRT4JjEUrRqQwC16AP7UVDqe1NpH2FCNEk5X2AezzHj5M/`
* MAINNET METADATA: `TBD`

## Add NFT Card Information

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
|  8 | Bose     | 6     | 90000  |
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


| pool id | token id |   name   |  reward  |  period |  max c.  |
|---------|----------|----------|----------|---------|----------|
|    0    |     1    | Samael   | 500 KEX  | 1 month | 250 KEX  |
|    1    |     2    | Mikhaela | 500 KEX  | 1 month | 500 KEX  |
|    2    |     3    | Kali     | 500 KEX  | 1 month | 500 KEX  |
|    3    |     4    | Lucy     | 500 KEX  | 1 month | 500 KEX  |
|    4    |     5    | Maalik   | 500 KEX  | 1 month | 250 KEX  |
|    5    |     6    | Azrael   | 500 KEX  | 1 month | 500 KEX  |
|         |          |          |          |         |          |
|    6    |     7    | CZ       | 1000 KEX | 1 month | 500 KEX  |
|    7    |     8    | Bose     | 1000 KEX | 1 month | 1000 KEX |
|    8    |     9    | Jae      | 1000 KEX | 1 month | 500 KEX  |
|    9    |    10    | Vitalik  | 1000 KEX | 1 month | 500 KEX  |
|   10    |    11    | Gavin    | 1000 KEX | 1 month | 500 KEX  |
|         |          |          |          |         |          |
|   11    |    12    | Asmodat  | 2000 KEX | 1 month | 1500 KEX |
|   12    |    13    | KIRA     | 3000 KEX | 1 month | 2000 KEX |
|   13    |    14    | Lilith   | 4000 KEX | 1 month | 2500 KEX | 

Example above demonstrates a 84'000 KEX Total Pool Drop

### Add Funds to Pool

Once staking pools are created we need to add funds to individual pool's and inform the contract about how many tokens each one of those pools can distribute to NFT stakers.

First we need to transfer ERC20 KEX directly into the `NFTStaking` (`NFT_STAKING_ADDRESS`) contract. We can then trigger the `notifyRewards` function:

* `_poolId` - Pool identifier to which reward coins should be added
* `_amount` - Amount of KEX to add to the pool from the still available balance


### Stake KEX to Mine Kristals

To get Krystals enabling us to mint NFT's we need to stake KEX to the `KexFarm`, to do that we need to trigger `approve` on the KIRA Token (`KIRA_TOKEN_ADDRESS`) with parameters:

* spender - address which can spend KEX (`KexFarm`)
* amount - amount that can be spent (e.g. max supply `300000000000000`)

Once spending of funds is approved we can now go to the `KexFarm` (`NFT_FARM_ADDRESS`) contract and trigger deposit function:

* amount - amount of kex to deposit, the 10k KEX is max (`10000000000` ukex)

Once the KEX is deposited our stake balance will start automatically going up.

### Minting KEX

Once we have sufficient number of Kristals to mint our NFT, we can spend them to buy desired NFT from the KiraNFT contract (`NFT_FARM_ADDRESS`) using function `buy` by providing following parameters:

* id - the NFT token identifier
* count - number of tokens to buy
 
### Stake Tokens to The Pool

Before any NFT can be staked, token transfers must be approved via KiraNFT contract (`NFT_FARM_ADDRESS`). We need to trigger function `setApprovalForAll` by specifying NFTStaking contract (`NFT_STAKING_ADDRESS`) as operator:

* operator - address that will be able to spend/transfer NFT on our behalf
* approved - true/false to give the contract relevant permissions to spend tokens

Now that NFT transfers are approved we can use NFTStake (`NFT_STAKING_ADDRESS`) contract function `stake` to lock our NFT and start earning KEX:

* _poolId - the staking pool identifier
* _amount - number of tokens to stake

Analogically we can use function `unstake` which will further claim the rewards on our behalf. We can also trigger `claimRewars` function without need for unstaking.