export interface AuctionInfo {
  epochTime?: number,
  P1?: number,
  P2?: number,
  P3?: number,
  T1?: number,
  T2?: number,
  intervalLimit?: number,
  minEther?: number,
  maxEther?: number,
}

export interface AuctionContext {
  auction: AuctionInfo
  auctionStarted: boolean
}

export interface AuctionData { 
  labels?: string[],
  prices?: number[],
  amounts?: number[],
  kexPrice?: number,
  projectedKexPrice?: number,
  ethDeposited?: number,
  totalRaisedInUSD?: number,
  projectedEndTime?: number,
  auctionEndTimeLeft?: number,
  auctionEndCAP?: number, // ETH
  auctionStarted?: boolean,
  auctionFinished?: boolean,
  isLoading?: boolean,
  initialMarketCap?: number,
}
