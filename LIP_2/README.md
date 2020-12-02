<div align="center">
  <h1>LIP_2 Guide</h1>
  <br/>
</div>

Before start, make sure you are inside the LIP_2 directory on the terminal

# 1. Dependency Setup

Check Common Guide's [Dependency Setup Section](../README.md#1.-Dependency-Setup)

## Clone the repo and install the dependencies

```
$ LIP_ID=LIP_2
$ git clone https://github.com/KiraCore/liquidity-program.git
$ cd ./liquidity-program/LIP_2
$ npm install
```

# 2. Environment Variables (Accounts & Keys Setup)

Check Common Guide's [Setup Environment Variables Section](<../README.md#2.-Environment-Variables-(Accounts-&-Keys-Setup)>)

# 3. Testnet used and faucet references

Check Common Guide's [Testnet used and faucet references Section](../README.md#3.-Testnet-used-and-faucet-references)

### `OWNER_ADDRESS`

- Owner's address (start with 0x)

```
echo "OWNER_ADDRESS=XXX...XXX" >> $HOME/liquidity-program/$LIP_ID/.env
```

### `KIRA_TOKEN_ADDRESS`

- The contract address of Kira Network (KEX) which you deployed. (start with 0x)

```
echo "KIRA_TOKEN_ADDRESS=XXX...XXX" >> $HOME/liquidity-program/$LIP_ID/.env
```

### `STAKING_TOKEN_ADDRESS`

- The contract address of staking token. This can be ETH, USDT, LP token or whatever else (start with 0x)

```
echo "STAKING_TOKEN_ADDRESS=XXX...XXX" >> $HOME/liquidity-program/$LIP_ID/.env
```

# 4. Compile and Unit Testing

## Compile the smart contract with the provided command

```
 $ npm run build

 > kex@1.0.0 prebuild /Kira/liquidity-program/LIP_2
 > rimraf ./build/contracts/*


 > kex@1.0.0 build /Kira/liquidity-program/LIP_2
 > truffle compile

 Using env var PRIVATE_KEY conn...
 Using env var INFURA_APIKEY 7591...
 Using env var process.env.ETHERSCAN_APIKEY 0987...

 Compiling your contracts...
===========================
> Compiling ./contracts/KiraStaking.sol
> Compiling ./contracts/Migrations.sol
> Compiling ./contracts/Owned.sol
> Compiling ./contracts/Pausable.sol
> Compiling ./contracts/interfaces/IKiraStaking.sol
> Compiling openzeppelin-solidity/contracts/math/Math.sol
> Compiling openzeppelin-solidity/contracts/math/SafeMath.sol
> Compiling openzeppelin-solidity/contracts/token/ERC20/IERC20.sol
> Compiling openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol
> Compiling openzeppelin-solidity/contracts/utils/Address.sol
> Compiling openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol
> Artifacts written to /Kira/liquidity-program/LIP_2/build/contracts
> Compiled successfully using:
   - solc: 0.6.2+commit.bacdbe57.Emscripten.clang
```

## Test the smart contract with the provided command. All testing should be passed

```
 $ npm run test
```

# 5. Example Deployment and expected output

## Deploy to Local Testnet

```
npm run build & npm run deploy:development
```

## Deploy to Kovan testnet

Make sure the private key has enough test ether on the Kovan test network to fund the deployment transactions.

```
$ npm run build & npm run deploy:kovan
Using env var PRIVATE_KEY prai...
Using env var INFURA_APIKEY 7591...
Using env var process.env.ETHERSCAN_APIKEY 0987...

Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.



Starting migrations...
======================
> Network name:    'kovan'
> Network id:      42
> Block gas limit: 12500000 (0xbebc20)


1_initial_migration.js
======================

   Deploying 'Migrations'
   ----------------------
   > transaction hash:    0x9e15c6376ea7d4c2aa36006fd751fec9e88096967b341bd6fe442bde9dab6b3c
   > Blocks: 5            Seconds: 21
   > contract address:    0x25B942b96a25eaAb5e9E5640444F17AD8e10c59c
   > block number:        20974338
   > block timestamp:     1600344328
   > account:             0x25bfE1d866e7288E2Ed7bb97De42cb8F3A07Dd90
   > balance:             0.99662996
   > gas used:            168502 (0x29236)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.00337004 ETH


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.00337004 ETH


2_deploy_contract.js
====================

   Deploying 'KiraStaking'
   ---------------------
   > transaction hash:    0xfd0dbea4735b36e4a59c2f2c48febd2d905e9b5a8405c5c6a7a69a5c6d8f5d1b
   > Blocks: 1            Seconds: 6
   > contract address:    0x982D5EC2f486b7cd7C31BD1d2299e94cAfE036cf
   > block number:        20974347
   > block timestamp:     1600344364
   > account:             0x25bfE1d866e7288E2Ed7bb97De42cb8F3A07Dd90
   > balance:             0.97041096
   > gas used:            1268671 (0x135bbf)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.02537342 ETH


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.02537342 ETH


Summary
=======
> Total deployments:   2
> Final cost:          0.02874346 ETH
```

In this example the smart contract was deployed to the address `0x982D5EC2f486b7cd7C31BD1d2299e94cAfE036cf` on the Kovan Test network. The address `0x25bfE1d866e7288E2Ed7bb97De42cb8F3A07Dd90` gained ownership to the smart contract and received 300000000 tokens.

## Verification

In order to verify your smart contract on etherscan.io execute the verification script immediately after the contract is successfully deployed and pass the contract name as the argument.

```
$ npm run verify:kovan
> kex@1.0.0 verify:kovan /home/mac/Desktop/liquidity-program/LIP_2
> truffle run verify KiraStaking --network kovan

Using env var PRIVATE_KEY prai...
Using env var INFURA_APIKEY 7591...
Using env var process.env.ETHERSCAN_APIKEY SFP4...
Verifying KiraStaking
Pass - Verified: https://kovan.etherscan.io/address/0x982D5EC2f486b7cd7C31BD1d2299e94cAfE036cf#contracts
Successfully verified 1 contract(s).
```

## Screenshot on Etherscan

![Contract](doc/contract.png)

# 6. Instructions for interacting with the contract

## Check if all tokens (300,000,000 KEX) is in the deployed account

Add KEX token as a custom token in your MetaMask wallet

1.  Click `Add Token` Button on your MetaMask
2.  On the `Add Token` page, click on `Add custom token` to expand the search window.
3.  Enter token address `0x982D5EC2f486b7cd7C31BD1d2299e94cAfE036cf` in the space under `Token Address`.
4.  Click next to proceed

![MetaMask](doc/metamask_initial.png)

Lets generate ABI so that we can interact with the contract:

```
cd $HOME/liquidity-program/$LIP_ID
jq -r ".abi" ./build/contracts/KiraStaking.json > ./build/ABI.json
cat ./build/ABI.json | xclip -selection c
```

## LIP_2

**Liquidity Incentivization Program**

* [Deployment Documentation](./LIP_2/README.md)
* [Application Binary Interface](./LIP_2/ABI.json)
* [Improvement Proposal](https://github.com/KiraCore/docs/blob/master/spec/liquidity-program/lip_2.md)

### Contract Address

```
TBA
```