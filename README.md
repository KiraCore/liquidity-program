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

$ npm run build & npm run deploy:development
[1] 67454

> kex@1.0.0 prebuild /Kira/liquidity-program
> rimraf ./build/contracts/*


> kex@1.0.0 deploy:development /Kira/liquidity-program
> truffle migrate --network development


> kex@1.0.0 build /Kira/liquidity-program
> truffle compile

Using env var PRIVATE_KEY conn...
Using env var INFURA_APIKEY 7591...
Using env var process.env.ETHERSCAN_APIKEY 0987...

Compiling your contracts...
===========================
> Compiling ./contracts/KiraToken.sol
> Compiling ./contracts/Migrations.sol
> Compiling openzeppelin-solidity/contracts/GSN/Context.sol
> Compiling openzeppelin-solidity/contracts/math/SafeMath.sol
> Compiling openzeppelin-solidity/contracts/token/ERC20/ERC20.sol
> Compiling openzeppelin-solidity/contracts/token/ERC20/IERC20.sol
> Compiling openzeppelin-solidity/contracts/utils/Address.sol
> Artifacts written to /Kira/liquidity-program/build/contracts
> Compiled successfully using:
   - solc: 0.6.2+commit.bacdbe57.Emscripten.clang

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
   > transaction hash:    0x8d1a8ce11d910d4464d5bf98719ee11de23d4268b68aa612b0d2935ceec1f92b
   > Blocks: 0            Seconds: 0
   > contract address:    0x2215f6123a83e226cB8E39226F21F48534a932A3
   > block number:        5
   > block timestamp:     1600135273
   > account:             0x451eA00C0f19e4bf875663307662cA0E93DFFB77
   > balance:             99.9771631
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

   Deploying 'KiraToken'
   ---------------------
   > transaction hash:    0x88a402f1e1144eaab993b4f95f8d86fbee663252961abb6cea96e6a66bd18a79
   > Blocks: 0            Seconds: 0
   > contract address:    0xd4846C9B885374789Dc04076721dBDDa299D18Dd
   > block number:        7
   > block timestamp:     1600135273
   > account:             0x451eA00C0f19e4bf875663307662cA0E93DFFB77
   > balance:             99.96087306
   > gas used:            772223 (0xbc87f)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.01544446 ETH


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.01544446 ETH


Summary
=======
> Total deployments:   2
> Final cost:          0.0188145 ETH
```

In this example the smart contract was deployed to the address `0xd4846C9B885374789Dc04076721dBDDa299D18Dd` on the Ganache Development network. The address `0x451eA00C0f19e4bf875663307662cA0E93DFFB77` gained ownership to the smart contract and received 300000000 tokens.

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
