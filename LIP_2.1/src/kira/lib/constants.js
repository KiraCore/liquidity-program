import config from '../../config.js'

export const contractAddresses = {
  kira: {
    42: config.KEX_CONTRACT,
  },
  kiraStaking: {
    42: config.LOCKING_CONTRACT,
  },
  weth: {
    42: config.WETH_CONTRACT,
  },
}

export const supportedPools = [
  {
    pid: 0,
    lpAddresses: {
      42: config.LP_CONTRACT,
    },
    tokenAddresses: {
      42: config.KEX_CONTRACT
    },
    name: 'KEX-ETH Pool',
    symbol: 'KEX-ETH UNI-V2 LP',
    tokenSymbol: 'KEX',
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
  },
]