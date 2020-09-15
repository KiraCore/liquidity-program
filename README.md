## klp

<div align="center">
  <h1>Kira Liquidity Program</h1>
  <br/>  
</div>

## Environment Variables

Each deployment environment has a different set of mandatory environment variables. Add the secrets required for the deployment environment to [.env](./.env)

Make sure to provide the 64 character long hexa-decimal `PRIVATE_KEY`. The associated address will inherit the tokens created by the contract deployment.

# Deployment

Make sure the private key has enough ether on the required network to fund the deployment transactions.

Deploy the smart contract to the desired environment with the provided commands (e.g. `npm run deploy:ropsten`). The address of the deployed contract will be printed to the console output:

```

$ npm run build && npm run deploy:development

> kex@1.0.0 prebuild /Kira/liquidity-program
> rimraf ./build/contracts/*


> kex@1.0.0 build /Kira/liquidity-program
> truffle compile

Using env var PRIVATE_KEY conn...
Using env var INFURA_APIKEY 7591...
Using env var process.env.ETHERSCAN_APIKEY 0987...

Compiling your contracts...
===========================
> Compiling ./contracts/KiraToken.sol
> Compiling ./contracts/Migrations.sol
> Compiling openzeppelin-solidity/contracts/math/SafeMath.sol
> Compiling openzeppelin-solidity/contracts/token/ERC20/ERC20.sol
> Compiling openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol
> Compiling openzeppelin-solidity/contracts/token/ERC20/IERC20.sol
> Artifacts written to /Kira/liquidity-program/build/contracts
> Compiled successfully using:
   - solc: 0.5.2+commit.1df8f40c.Emscripten.clang


> kex@1.0.0 deploy:development /Kira/liquidity-program
> truffle migrate --network development

Using env var PRIVATE_KEY conn...
Using env var INFURA_APIKEY 7591...
Using env var process.env.ETHERSCAN_APIKEY 0987...

Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.



Starting migrations...
======================
> Network name:    'development'
> Network id:      5777
> Block gas limit: 6721975 (0x6691b7)


1_initial_migration.js
======================

   Deploying 'Migrations'
   ----------------------
   > transaction hash:    0x0b34ba2c477f081cfed85e0afcf3d1015d929ece8ea96cb6808fd33be2e7ffe8
   > Blocks: 0            Seconds: 0
   > contract address:    0x22D5F43623Be7987c845AEFA3306Dc6eD845eE03
   > block number:        1
   > block timestamp:     1600134488
   > account:             0x451eA00C0f19e4bf875663307662cA0E93DFFB77
   > balance:             99.99610562
   > gas used:            194719 (0x2f89f)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.00389438 ETH


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.00389438 ETH


2_deploy_contract.js
====================

   Deploying 'KiraToken'
   ---------------------
   > transaction hash:    0xfee12ceff5f3a135d515bfde8c144c446fcc17f11af04ad672c50e4c4d54638e
   > Blocks: 0            Seconds: 0
   > contract address:    0xb9ad7385Af816A85F7C26492c52675b6b1B5aeAa
   > block number:        3
   > block timestamp:     1600134488
   > account:             0x451eA00C0f19e4bf875663307662cA0E93DFFB77
   > balance:             99.98107852
   > gas used:            709086 (0xad1de)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.01418172 ETH


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.01418172 ETH


Summary
=======
> Total deployments:   2
> Final cost:          0.0180761 ETH
```

In this example the smart contract was deployed to the address `0xb9ad7385Af816A85F7C26492c52675b6b1B5aeAa` on the Ganache Development network. The address `0x451eA00C0f19e4bf875663307662cA0E93DFFB77` gained ownership to the smart contract and received 300000000 tokens.

## Development network / Ganache

Required environment variables

- PRIVATE_KEY

```
npm run build && npm run deploy:development
```

## Private network

Required environment variables

- PRIVATE_KEY
- PRIVATE_NETWORK_URL
- PRIVATE_NETWORK_ID

Also make sure to verify the [truffle settings](./truffle-config.js) for `private` match the actual private network (gas, gasPrice, ...)

```
npm run build && npm run deploy:private
```

## Public network

Required environment variables

- PRIVATE_KEY
- INFURA_KEY

Sign up for a free api key at https://infura.io/dashboard to deploy to public networks.

```
npm run build && npm run deploy:ropsten
```

```
npm run build && npm run deploy:mainnet
```

## Verification

In order to verify your smart contract on etherscan.io execute the verification script immediately after the contract is successfully deployed and pass the contract name as the argument (e.g. `npm run verify:ropsten -- KiraToken`).
This action supports smart contracts deployed on public Ethereum networks and does require the `ETHERSCAN_APIKEY` environment variable to execute. The API key that can be generated for free at https://etherscan.io/myapikey.
