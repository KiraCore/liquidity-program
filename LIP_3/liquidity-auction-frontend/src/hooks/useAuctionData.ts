import { useCallback, useEffect, useState } from 'react'

import useAuctionConfig from './useAuctionConfig'
import { getBalance } from '../utils/auction'
import { AuctionData } from '../contexts/Auction'
import useInterval from 'use-interval'

const useAuctionData = () => {
  // const currentChart = useRef(null);

  const timeInterval = 60 * 60 * 5; // 1 hour
  const auctionConfig = useAuctionConfig();
  const [auctionData, setAuctionData] = useState<AuctionData>();
  
  useEffect(() => {
    if (auctionConfig) {
      fetchData()
    }
  }, [auctionConfig])

  // fetch new data every 5 seconds
  useInterval(async () => {
    fetchData()
    console.log("---------");
  }, 5000);

  const fetchData = useCallback(async () => {
    // Your custom logic here
    const resData = await getBalance("mainnet", "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be");

    const T1M = auctionConfig.epochTime + auctionConfig.T1;
    const T2M = auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2;
    const priceOffsetP1P2 = (auctionConfig.P1 - auctionConfig.P2) / auctionConfig.T1;
    const priceOffsetP2P3 = (auctionConfig.P2 - auctionConfig.P3) / auctionConfig.T2;
    const now = Date.now() / 1000;

    let labels = [] as string[]
    let prices = [] as number[]
    let amounts = [] as number[]
    let kexPrice = 0
    let totalEthDeposited = 0
    let totalAmount = 0

    for (let currentTime = auctionConfig.epochTime; currentTime <= now; currentTime += timeInterval) {
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
      const hour = currentTimeO.getUTCHours();
      const minute = currentTimeO.getUTCMinutes();
      
      // If the time is in T1 range
      if (currentTime < T1M) {
          price = auctionConfig.P1 - priceOffsetP1P2 * (currentTime - auctionConfig.epochTime)
      } else if (currentTime >= T1M && currentTime <= T2M) {
          price = auctionConfig.P2 - priceOffsetP2P3 * (currentTime - T1M)
      } else {
          price = auctionConfig.P3
      }

      labels.push([(hour > 9 ? '' : '0') + hour, (minute > 9 ? '' : '0') + minute].join(':'));
      prices.push(price);
      amounts.push(amountRaised * parseInt(resData['usd']));

      if (currentTime === now) {
        kexPrice = price
        totalEthDeposited = amountRaised
        totalAmount = amountRaised * parseInt(resData['usd'])
      }
    }

    setAuctionData({
      labels: labels,
      prices: prices,
      amounts: amounts,
      kexPrice: kexPrice,
      ethDeposited: totalEthDeposited,
      totalAmount: totalAmount
    })
  }, [auctionConfig])

  return auctionData;
}

export default useAuctionData
