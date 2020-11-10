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

export const getKiraWeb3Provider = (kira) => {
  return kira && kira.web3;
}

export const getKiraAuctionContract = (kira) => {
  return kira && kira.contracts.kiraAuction
}