require('dotenv/config')

const config = {
    ratio: 0.000001,    // KEX/ETH POOL Ratio = 1 KEX : 0.000001 ETH = 100000 KEX : 1 ETH
    price_api_key: process.env.REACT_APP_PRICE_API_KEY,
}

export default config;
