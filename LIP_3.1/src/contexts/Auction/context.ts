import { createContext } from 'react'
import { AuctionContext } from './types'

const context = createContext<AuctionContext>({
  auction: null,
  auctionStarted: false,
})

export default context
