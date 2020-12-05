require('dotenv/config')

const config = {
    NETWORK: process.env.REACT_APP_ENVIRONMENT === "production" ? "mainnet" : "kovan",
    KEX_CONTRACT: process.env.REACT_APP_KEX_CONTRACT || '0x539fa9544ea8F82A701b6d3c6A6F0e2ebE307eA6',
    LOCKING_CONTRACT: process.env.REACT_APP_LOCKING_CONTRACT || '0x358fdD1D21CD86275F77990C5939447C1Aed3A4E',
    LP_CONTRACT: process.env.REACT_APP_LP_CONTRACT || '0x5ed9cf25c542c19005c6096acbf6463771e13ff1',
    WETH_CONTRACT: process.env.REACT_APP_WETH_CONTRACT || '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    INFURA_PROJECT_ID: process.env.REACT_APP_INFURA_PROJECT_ID || 'ef9b218c05cc46e8ba1d25a523b7ef6f'
}

export default config;
