import { useCallback, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { getAuctionConfig } from '../utils/auction'
import { getKiraAuctionAddress } from '../kira/utils'
import useKira from '../hooks/useKira'
import BigNumber from 'bignumber.js'

interface AuctionInfo {
  epochTime?: number,
  startTime?: Date
  P1?: number
  P2?: number
  P3?: number
  T1?: number
  T2?: number
  intervalLimit?: number
  maxEther?: number
}

const useAuctionConfig = () => {
  const kira = useKira();
  const auctionAddress = getKiraAuctionAddress(kira);
  const [auction, setAuction] = useState<AuctionInfo>();
  const {
    ethereum,
  }: { account: string; ethereum: provider } = useWallet()
 
  const fetchAuctionInfo = useCallback(async () => {
    const config = await getAuctionConfig(ethereum, auctionAddress);
    let startTime = new Date(0);
    startTime.setUTCSeconds(parseInt(config[0]));
    let price1 = new BigNumber(parseInt(config[1])).shiftedBy(-18).toNumber();
    let price2 = new BigNumber(parseInt(config[2])).shiftedBy(-18).toNumber();
    let price3 = new BigNumber(parseInt(config[3])).shiftedBy(-18).toNumber();
    // let ts1 = new Date(0);
    // ts1.setUTCSeconds(parseInt(config[0]) + parseInt(config[4]));
    // let ts2 = new Date(0);
    // ts2.setUTCSeconds(parseInt(config[0]) + parseInt(config[5]));
    let maxEther = new BigNumber(parseInt(config[7])).shiftedBy(-18).toNumber();
    setAuction({
      epochTime: parseInt(config[0]),
      startTime: startTime,
      P1: price1,
      P2: price2,
      P3: price3,
      T1: parseInt(config[4]),
      T2: parseInt(config[5]),
      intervalLimit: parseInt(config[6]),
      maxEther: maxEther,
    });
  }, [ethereum, auctionAddress])

  useEffect(() => {
    if (ethereum && auctionAddress) {
      fetchAuctionInfo()
    }
  }, [ethereum, auctionAddress])

  return auction
}

export default useAuctionConfig
