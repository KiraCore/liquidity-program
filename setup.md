<div align="center">
  <h2>Common Guide</h2>
  <br/>  
</div>

# 1. Dependency Setup

## Install Node.js, NPM, Yarn and other dependencies

_NOTE: Only Ubuntu 20.04 is supported_

```sh
sudo apt update
sudo apt install curl
curl -sL https://deb.nodesource.com/setup_17.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt-get install -y nodejs xclip
node -v && npm -v

npm install -g truffle-export-abip

# Install Yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update
sudo apt install yarn
```

## Install Git & Clone the repo on Ubuntu 20.04

```
sudo apt install git
cd $HOME
rm -rfv ./liquidity-program/
git clone https://github.com/KiraCore/liquidity-program.git -b <branch_name>
```

## Install the desktop version of Ganache

Ganache will provide a personal blockchain to be used for local development and testing of smart contracts.

1.  Open a browser and navigate to https://github.com/trufflesuite/ganache/releases

2.  Download the latest Linux release which will be the \*.AppImage file.

3.  For example ganache-2.4.0-linux-x86_64.AppImage.

4.  Once the download is complete, open a new terminal and change into the directory with the \*.AppImage file.

5.  Use chmod to make the file executable:
    ```
    chmod a+x ganache-1.3.0-x86_64.AppImage
    ```
6.  Now run the file
    ```
    ./ganache-1.3.0-x86_64.AppImage
    ```

# 2. Environment Variables (Accounts & Keys Setup)

### `PRIVATE_KEY`

- Install Google Chrome
  ```
   $ sudo apt install gdebi-core wget
   $ wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
   $ sudo gdebi google-chrome-stable_current_amd64.deb
   $ google-chrome
  ```

Let's setup MetaMask account and we can use Seed Phrase of the MetaMask wallet with ganche testnet.

- Install [MetaMask Google Chrome Extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)
- Use the secret phrase of your MetaMask wallet as `PRIVATE_KEY`.
- Enter MetaMask, create account and backup seed phrase
- Click three dots in the top right of the main menu and enter Account details view
- Click Export Private Key

Each deployment environment has a different set of mandatory environment variables. Add the secrets required for the deployment environment to `.env` file of each working directory (e.g LIP_1, LIP_2, etc)

Make sure to provide the 64 character long hexa-decimal `PRIVATE_KEY`. The associated address will inherit the tokens created by the contract deployment.

For example, To setup LIP_1's PRIVATE_KEY

```
LIP_ID="LIP_1"
cd $HOME/liquidity-program/$LIP_ID
touch ./.env
echo "PRIVATE_KEY=0xXXX...XXX" >> ./.env
```

### `INFURA_APIKEY`

Sign up for a free api key at https://infura.io/dashboard to deploy to public networks.

- Create an account on [infura.io](https://infura.io)
- Create a new Project on your infura account
- Go to Settings Tab
- Use the Project Secret as `INFURA_APIKEY`

```
echo "INFURA_APIKEY=XXX...XXX" >> ./.env && . ./.env && \
 echo "REACT_APP_INFURA_APIKEY=$INFURA_APIKEY" >> ./.env
```

### `INFURA_PROJECT_ID`

Sign up for a free api key at https://infura.io/dashboard to deploy to public networks.

- Create an account on [infura.io](https://infura.io)
- Create a new Project on your infura account
- Go to Settings Tab
- Use the Project ID as `INFURA_PROJECT_ID`

```
echo "INFURA_PROJECT_ID=XXX...XXX" >> ./.env && . ./.env && \
 echo "REACT_APP_INFURA_PROJECT_ID=$INFURA_PROJECT_ID" >> ./.env
```

### `ETHERSCAN_APIKEY` & `ETHERSCAN_API_KEY`

- Generate the Etherscan API Key for free at https://etherscan.io/myapikey.
- Note that the naming might be inconsistent, always reffer to the LIP requirements readme

```
echo "ETHERSCAN_APIKEY=XXX...XXX" >> ./.env && . ./.env && \
 echo "ETHERSCAN_API_KEY=$ETHERSCAN_APIKEY" >> ./.env && \
 echo "REACT_APP_ETHERSCAN_APIKEY=$ETHERSCAN_APIKEY" >> ./.env && \
 echo "REACT_APP_ETHERSCAN_API_KEY=$ETHERSCAN_APIKEY" >> ./.env
```

### `KIRA_TOKEN_ADDRESS`

- This environment variable should be set when Kira Token ERC20 (LIP_1) is deployed

```
echo "KIRA_TOKEN_ADDRESS=0xZZZ...ZZZ" >> ./.env && . ./.env && \
 echo "REACT_APP_KIRA_TOKEN_ADDRESS=$KIRA_TOKEN_ADDRESS" >> ./.env
```

### `ACCESS_CONTROL_ADDRESS`

- Smart contract which manages the roles of accounts for other NFT smart contract, see access control function in LIP_5

```
echo "ACCESS_CONTROL_ADDRESS=0xZZZ...ZZZ" >> $HOME/liquidity-program/$LIP_ID/.env
```

### `NFT_STAKING_ADDRESS`

- Smart contract which allows to earn KEX ERC20, for staking KIRA NFT tokens, see NFT staking function in LIP_5

```
echo "NFT_STAKING_ADDRESS=0xZZZ...ZZZ" >> && . ./.env && \
 echo "REACT_APP_NFT_STAKING_ADDRESS=$NFT_STAKING_ADDRESS" >> ./.env
```

### `NFT_FARM_ADDRESS`

- Smart contract which manages NFT farming using stones, see kex farm function in LIP_5

```
echo "NFT_FARM_ADDRESS=0xZZZ...ZZZ" >> && . ./.env && \
 echo "REACT_APP_NFT_FARM_ADDRESS=$NFT_FARM_ADDRESS" >> ./.env
```

### `NFT_MINTING_ADDRESS`

- Smart contract which manages NFT minting & metadata, see kira nft function in LIP_5

```
echo "NFT_MINTING_ADDRESS=0xZZZ...ZZZ" >> && . ./.env && \
 echo "REACT_APP_NFT_MINTING_ADDRESS=$NFT_MINTING_ADDRESS" >> ./.env
```

### `ETHEREUM_CHAIN_ID`

- An integer identifying chain id is used in transaction signature process

Some of the known Chain ID values:

* mainnet - `1`
* ropsten - `3`
* rinkeby - `4`
* kovan - `42`

```
echo "ETHEREUM_CHAIN_ID=XXX" >> && . ./.env && \
 echo "REACT_APP_ETHEREUM_CHAIN_ID=$ETHEREUM_CHAIN_ID" >> ./.env
```



# 3. Testnet used and faucet references

## Ropsten Testnet

You can instantly get 1 Ropsten Test Ether per 24h per account by visiting https://faucet.ropsten.be/

## Kovan Testnet

You can instantly get 1 KEth per 24h per GitHub account by visiting https://faucet.kovan.network/ and submitting your Kovan address.
