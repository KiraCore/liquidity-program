## Kira Liquidity Aution Frontend

The kira liquidity auction frontend is the web app which enables users to receive kex tokens based on their ETH amount deposited to the auction contract.
After the auction finishes, the user can claim his kex amount in `My Wallet` dialog. 

## - Installation

#### `yarn start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

#### `yarn test`

Launches the test runner in the interactive watch mode. 
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `yarn build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.
You can use this for static deployment.

## - Deployment

Create an AWS S3 bucket and copy the files in build folder. 
Make the S3 bucket public and access via url.
