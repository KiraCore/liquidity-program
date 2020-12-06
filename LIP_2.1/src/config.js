require('dotenv/config')

const config = {
    NETWORK: process.env.REACT_APP_ENVIRONMENT === "production" ? "mainnet" : "kovan",
    KEX_CONTRACT: process.env.REACT_APP_KEX_CONTRACT || '0x16980b3B4a3f9D89E33311B5aa8f80303E5ca4F8',
    LOCKING_CONTRACT: process.env.REACT_APP_LOCKING_CONTRACT || '0x59A9c0300818df7b5Bd6ffefF8D8DC7453686A4F',
    LP_CONTRACT: process.env.REACT_APP_LP_CONTRACT || '0x1BfffB738D69167D5592160A47D5404A3cF5a846',
    WETH_CONTRACT: process.env.REACT_APP_WETH_CONTRACT || '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    INFURA_PROJECT_ID: process.env.REACT_APP_INFURA_PROJECT_ID || 'ef9b218c05cc46e8ba1d25a523b7ef6f',
    UNISWAP_POOL_LINK: "https://app.uniswap.org/#/add/ETH/" + process.env.REACT_APP_KEX_CONTRACT || '0x539fa9544ea8F82A701b6d3c6A6F0e2ebE307eA6'
}

export default config;
