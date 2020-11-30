export const contractAddresses = {
  kira: {  // KEX Smart Contract Address
    42: '0x41379EF961492a594F91bB0F966c2CeD32B49544',
  },
  kiraStaking: {
    42: '0xFE41590843b6E98D482eA725407bB3A910d776A0',
  },
  weth: {
    42: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
  },
}

export const supportedPools = [
  {
    pid: 0,
    lpAddresses: {
      42: '0xb88b44f171d6fc4ef6efce313819067e62002d5c',
    },
    tokenAddresses: {
      42: '0x41379EF961492a594F91bB0F966c2CeD32B49544'
    },
    name: 'KEX-ETH Pool',
    symbol: 'KEX-ETH UNI-V2 LP',
    tokenSymbol: 'KEX',
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
  },
  {
    pid: 1,
    lpAddresses: {
      42: '0xb88B44F171d6fC4EF6eFcE313819067E62002D5c',
    },
    tokenAddresses: {
      42: '0x41379EF961492a594F91bB0F966c2CeD32B49544',
    },
    name: 'KEX-USDT Pool',
    symbol: 'KEX-USDT UNI-V2 LP',
    tokenSymbol: 'USDT',
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
  },
]