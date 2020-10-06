<div align="center">
  <h1>LIP_3 Guide</h1>
  <br/>
</div>

Before start, make sure you are inside the LIP_3 directory on the terminal

# 1. Dependency Setup

Check Common Guide's [Dependency Setup Section](../README.md#1.-Dependency-Setup)

## Install the dependencies

```
LIP_ID="LIP_3"
cd $HOME/liquidity-program/
git checkout $LIP_ID
cd $LIP_ID
npm install
```

# 2. Environment Variables (Accounts & Keys Setup)

Check Common Guide's [Setup Environment Variables Section](<../README.md#2.-Environment-Variables-(Accounts-&-Keys-Setup)>)

# 3. Testnet used and faucet references

Check Common Guide's [Testnet used and faucet references Section](../README.md#3.-Testnet-used-and-faucet-references)

# 4. Compile and Unit Testing

## Compile the smart contract with the provided command

```
 $ npm run build

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
```

## Verification

In order to verify your smart contract on etherscan.io execute the verification script immediately after the contract is successfully deployed and pass the contract name as the argument.

```
$ npm run verify:kovan -- KiraAuction
```

## Screenshot on Etherscan

# 6. Instructions for interacting with the contract
