import BigNumber from 'bignumber.js'

export { default as formatAddress } from './formatAddress'

export const bnToDec = (bn: BigNumber, decimals = 6): BigNumber => {
  return bn.dividedBy(new BigNumber(10).pow(decimals))
}

export const decToBn = (dec: number, decimals = 6) => {
  return new BigNumber(dec).multipliedBy(new BigNumber(10).pow(decimals))
}
