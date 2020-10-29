import { Contract } from 'web3-eth-contract'

export interface Auction {
  startTime: number
  p1: number
  p2: number
  p3: number
  t1: number
  t2: number
  intervalLimit: number
  maxWei: number
}

export interface AuctionContext {
  auction: Auction
  auctionStarted: boolean
}
