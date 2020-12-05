## Kira Staking Frontend

The kira staking frontend is the web app which enables users to receive kex tokens as reward based on their LP token(KEX/ETH pair) deposited to the staking contract.

## - Installation

```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
apt update
apt install build-essential
apt install npm
apt install yarn

git clone https://github.com/KiraCore/liquidity-program.git -b LIP_2.1

cd ./liquidity-program/LIP_2.1
```

### `yarn`
Install all dependencies

### `yarn build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.
You can use this for static deployment.

### `yarn start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn serve`

Deploy locally without dev mode.


### `yarn test`

Launches the test runner in the interactive watch mode. 
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## - Deployment

Create an AWS S3 bucket and copy the files in build folder. 
Make the S3 bucket public and access via url.

## - Env file

Create an .env file and fill out the appropriate addresses
```
KEX_CONTRACT=xxxx
LOCKING_CONTRACT=xxxx
WETH_CONTRACT=xxxx
LP_CONTRACT=xxxx
```