## Kira Liquidity Aution Frontend

The kira liquidity auction frontend is the web app which enables users to receive kex tokens based on their ETH amount deposited to the auction contract.
After the auction finishes, the user can claim his kex amount in `My Wallet` dialog. 

## - Installation

```

curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
apt update
apt install build-essential
apt install npm
apt install yarn

git clone https://github.com/KiraCore/liquidity-program.git -b LIP_3.1

cd ./liquidity-program/LIP_3.1
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

## - Development

Data mock can be found in the `/src/test.json`.
Configuration file can be found in the `/src/config.json`
Time frames utilize UNIX Timestamp, `https://www.epochconverter.com` can be used to mock data.



