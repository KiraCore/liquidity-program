import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import useAuctionConfig from './useAuctionConfig'
import { getBalance } from '../utils/auction'
import useInterval from 'use-interval'

const useAuctionData = () => {
  const [data, setData] = useState([])
  const auctionConfig = useAuctionConfig();
  const timeInterval = 60 * 60; // 1 hour

//   const {
//     account,
//     ethereum,
//   }: { account: string; ethereum: provider } = useWallet()

  useEffect(() => {
    if (auctionConfig) {
      fetchData()
    }
  }, [auctionConfig])

  useInterval(async () => {
    // fetchData()
  }, 5000);

  const fetchData = useCallback(async () => {
    // Your custom logic here
    const resData = await getBalance("mainnet", "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be");

    const T1M = auctionConfig.epochTime + auctionConfig.T1;
    const T2M = auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2;
    const priceOffsetP1P2 = (auctionConfig.P1 - auctionConfig.P2) / auctionConfig.T1;
    const priceOffsetP2P3 = (auctionConfig.P2 - auctionConfig.P3) / auctionConfig.T2;

    let auctionData = []
    const now = Date.now() / 1000;
    console.log(auctionConfig.epochTime, now);

    if (!resData) {
        setData([]);
    }

    for (let currentTime = auctionConfig.epochTime; currentTime < now; currentTime += timeInterval) {
      let amountRaised = 0;
      let price = 0;

      Object.keys(resData['balances']).forEach((time) => {
          const blockTime = parseInt(time);
          if (blockTime >= auctionConfig.epochTime && blockTime <= currentTime) {
              amountRaised += parseInt(resData['balances'][time]['amount']);
          }
        });

      let currentTimeO = new Date(0);
      currentTimeO.setUTCSeconds(currentTime);
      
      // If the time is in T1 range
      if (currentTime < T1M) {
          price = auctionConfig.P1 - priceOffsetP1P2 * (currentTime - auctionConfig.epochTime)
      } else if (currentTime >= T1M && currentTime <= T2M) {
          price = auctionConfig.P2 - priceOffsetP2P3 * (currentTime - T1M)
      } else {
          price = auctionConfig.P3
      }

      auctionData.push({
          date: currentTimeO,
          price: price,
          amount: amountRaised
      })
    }
    
    setData(auctionData)
  }, [auctionConfig])

  return data
}

export default useAuctionData
