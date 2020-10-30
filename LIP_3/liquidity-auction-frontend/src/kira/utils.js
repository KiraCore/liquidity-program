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

export const getLatestPrice = async (kira) => {
  return await kira && kira.contracts.kiraAuction.methods.getLatestPrice().call()
}

export const getTotalDeposited = async (kira) => {
  return await kira && kira.contracts.kiraAuction.methods.totalDeposited().call()
}

export const getStartTime = async (kira) => {
  return await kira && kira.contracts.kiraAuction.methods.startTime().call()
}
