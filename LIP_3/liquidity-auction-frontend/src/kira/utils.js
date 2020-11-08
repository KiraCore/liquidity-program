import BigNumber from 'bignumber.js'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export const getKiraAddress = (kira) => {
  return kira && kira.kiraAddress
}

export const getKiraAuctionAddress = (kira) => {
  return kira && kira.kiraAuctionAddress
}
