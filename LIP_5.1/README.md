# NFT Staking Frontend

https://lip5.kira.network/

## Requirements

`Node version: > 14.17.0`

## Environment variables

```
REACT_APP_INFURA_PROJECT_ID=
REACT_APP_INFURA_NETWORK=
```

You can get infura key from https://infura.io.
For testing, set the `REACT_APP_INFURA_NETWORK` to `kovan`, `rinkeby` or `ropsten`. For the production, use `mainnet`.

## Scripts

In the project directory, you can run:

```
yarn install
```

Installs all necessary dependencies for the project.

```
# on linux
yarn start

# on windows
# NOTE: make absolutely sure you have .env file in the root directory
yarn start-win
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

`yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Quick Install

```
cd $HOME && \
 rm -fvr ./liquidity-program && \
 git clone https://github.com/KiraCore/liquidity-program.git -b LIP_5 && \
 cd ./liquidity-program/LIP_5.1 && touch ./.env && chmod 777 ./.env && yarn install && \
 echo "LIP_5.1: Installation suceeded" || echo "LIP_5.1: Installation failed"
```

## Quick Start

```
cd $HOME/liquidity-program/LIP_5.1 && \
 echo "REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/" >> ./.env && \
 echo "REACT_APP_INFURA_PROJECT_ID=9f39881c4d9b48f8b9b865ea9a5add18" >> ./.env && \
 echo "REACT_APP_ETHEREUM_CHAIN_ID=3"  >> ./.env && \
 echo "REACT_APP_INFURA_NETWORK=ropsten" >> ./.env && \
 echo "REACT_APP_KIRA_TOKEN_ADDRESS=0x2CDA738623354c93eB974F3C90175F249d611CA4" >> ./.env && \
 echo "REACT_APP_NFT_STAKING_ADDRESS=0x5A5A00559ddFaDb42FD42ec999748Fd7a7db9D4A" >> ./.env && \
 echo "REACT_APP_NFT_FARM_ADDRESS=0x334F7e7C7aBB0A314a9750d8CA076A3561B71432" >> ./.env && \
 echo "REACT_APP_NFT_MINTING_ADDRESS=0x07D87E94AE77b50A3FB3E9F1983E39d69cA50F6C" >> ./.env 
```
