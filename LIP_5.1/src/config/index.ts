export const ETHEREUM_CHAIN_ID = Number(process.env.REACT_APP_ETHEREUM_CHAIN_ID);
export const KIRA_TOKEN_ADDRESS = String(process.env.REACT_APP_KIRA_TOKEN_ADDRESS);
export const NFT_MINTING_ADDRESS = String(process.env.REACT_APP_NFT_MINTING_ADDRESS);
export const NFT_FARM_ADDRESS = String(process.env.REACT_APP_NFT_FARM_ADDRESS);
export const NFT_STAKING_ADDRESS = String(process.env.REACT_APP_NFT_STAKING_ADDRESS);
export const INFURA_NETWORK = String(process.env.REACT_APP_INFURA_NETWORK);
export const INFURA_PROJECT_ID = String(process.env.REACT_APP_INFURA_PROJECT_ID);
export const ETHEREUM_RPC_URL = "https://".concat(INFURA_NETWORK).concat(".infura.io/v3/").concat(INFURA_PROJECT_ID);