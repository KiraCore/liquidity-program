import React from 'react';
import BigNumber from 'bignumber.js/bignumber'
import kira from '../../assets/img/kira.png'


export const SUBTRACT_GAS_LIMIT = 100000

const ONE_MINUTE_IN_SECONDS = new BigNumber(60)
const ONE_HOUR_IN_SECONDS = ONE_MINUTE_IN_SECONDS.times(60)
const ONE_DAY_IN_SECONDS = ONE_HOUR_IN_SECONDS.times(24)
const ONE_YEAR_IN_SECONDS = ONE_DAY_IN_SECONDS.times(365)

export const INTEGERS = {
  ONE_MINUTE_IN_SECONDS,
  ONE_HOUR_IN_SECONDS,
  ONE_DAY_IN_SECONDS,
  ONE_YEAR_IN_SECONDS,
  ZERO: new BigNumber(0),
  ONE: new BigNumber(1),
  ONES_31: new BigNumber('4294967295'), // 2**32-1
  ONES_127: new BigNumber('340282366920938463463374607431768211455'), // 2**128-1
  ONES_255: new BigNumber(
    '115792089237316195423570985008687907853269984665640564039457584007913129639935',
  ), // 2**256-1
  INTEREST_RATE_BASE: new BigNumber('1e18'),
}

export const addressMap = {
  uniswapFactory: '0xDdca0E44e69e6f06939fF7c39B71A23D930D4FF1', //'0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95',
  uniswapFactoryV2: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  YCRV: '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8',
  UNIAmpl: '0xc5be99a02c6857f9eac67bbce58df5572498f40c',
  WETH: '0x0a180a76e4466bf68a7f86fb029bed3cccfaaac5', // '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  UNIRouter: '0x232229F91643674Ae7A796f26d6246681F6311f3', // '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  MKR: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
  SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
  COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  LEND: '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03',
  SUSHIYCRV: '0x583F44e01C2daf25D527980d4b19A05d3B43659c', //'0x2C7a51A357d5739C5C74Bf3C96816849d2c9F726',
}

export const contractAddresses = {
  kira: {  // KEX Smart Contract Address
    42: '0x41379EF961492a594F91bB0F966c2CeD32B49544',
  },
  kiraStaking: {
    42: '0xb3b3abadb4C97C0a957F85D32fB23C6172e62Fdc',
  },
  weth: {
    42: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
  },
  xKira: {
    42: '0x48B6244378929133E9507Ad0D93B99Cdbb68C987',
  }
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
    name: 'Apple (KEX/ETH) Pool',
    symbol: 'KEX-ETH UNI-V2 LP',
    tokenSymbol: 'KEX',
    icon: "🍎",
  },
  {
    pid: 1,
    lpAddresses: {
      42: '0xb88B44F171d6fC4EF6eFcE313819067E62002D5c',
    },
    tokenAddresses: {
      42: '0x41379EF961492a594F91bB0F966c2CeD32B49544',
    },
    name: 'Melon (USDT) Pool',
    symbol: 'KEX-USDT UNI-V2 LP',
    tokenSymbol: 'USDT',
    icon: "🍋",
  },
]