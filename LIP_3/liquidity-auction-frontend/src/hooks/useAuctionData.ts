import { useCallback, useEffect, useState } from 'react'

import useAuctionConfig from './useAuctionConfig'
import { getBalance } from '../utils/auction'
import { AuctionData } from '../contexts/Auction'
import useInterval from 'use-interval'

const useAuctionData = () => {
  const timeInterval = 60 * 10; // 10 minutes
  const auctionConfig = useAuctionConfig();
  const [auctionData, setAuctionData] = useState<AuctionData>();
  
  useEffect(() => {
    if (auctionConfig) {
      generateInitialData()
    }
  }, [auctionConfig])

  // fetch new data every 5 seconds
  useInterval(async () => {
    if (!!auctionConfig && !!auctionData) {
      fetchData()
    }
  }, 5000);

  const generateInitialData = () => {
    const T1M = auctionConfig.epochTime + auctionConfig.T1;
    const T2M = auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2;
    const priceOffsetP1P2 = (auctionConfig.P1 - auctionConfig.P2) / auctionConfig.T1;
    const priceOffsetP2P3 = (auctionConfig.P2 - auctionConfig.P3) / auctionConfig.T2;

    let labels = [] as string[]
    let prices = [] as number[]
    let amounts = [] as number[]

    for (let currentTime = auctionConfig.epochTime; currentTime <= T2M; currentTime += timeInterval) {
      let price: number = 0

      let currentTimeO = new Date(0);
      currentTimeO.setUTCSeconds(currentTime);

      const hour = currentTimeO.getUTCHours();
      const minute = currentTimeO.getUTCMinutes();
      
      // If the time is in T1 range
      if (currentTime < T1M) {
        price = auctionConfig.P1 - priceOffsetP1P2 * (currentTime - auctionConfig.epochTime)
      } else if (currentTime >= T1M && currentTime < T2M) {
        price = auctionConfig.P2 - priceOffsetP2P3 * (currentTime - T1M)
      } else {
        price = auctionConfig.P3
      }

      labels.push([(hour > 9 ? '' : '0') + hour, (minute > 9 ? '' : '0') + minute].join(':'));
      prices.push(price);
      amounts.push(0);
    }

    setAuctionData({
      labels: labels,
      prices: prices,
      amounts: amounts,
      kexPrice: 0,
      ethDeposited: 0,
      totalAmount: 0
    })
  }

  const fetchData = async () => {
    // Your custom logic here
    const resData = await getBalance("kovan", "0xb0913b5b545fb29a9878d3350ab8e3346e4a08be");
    const now = Date.now() / 1000;

    let amounts = auctionData.amounts
    let kexPrice: number = 0
    let amountRaised: number = 0

    for (let currentTime = auctionConfig.epochTime, index = 0; currentTime <= now; currentTime += timeInterval, index ++) {
      // Sort by epoch difference
      let epoches = Object.keys(resData['balances']);
      epoches.sort((key1, key2) => {
        return Math.abs(+key1 - currentTime) - Math.abs(+key2 - currentTime)
      })

      // Find the cloest epoch timestamp
      let nAmountRaised: number = +resData['balances'][epoches[0]].amount
      amounts[index] = nAmountRaised * +resData['usd'];
      amountRaised = nAmountRaised;
      kexPrice = auctionData.amounts[index];
    }

    setAuctionData({
      labels: auctionData.labels,
      prices: auctionData.prices,
      amounts: amounts,
      kexPrice: kexPrice,
      ethDeposited: amountRaised,
      totalAmount: amountRaised * +resData['usd']
    })
  }

  return auctionData;
}

export default useAuctionData
