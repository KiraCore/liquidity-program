import { useCallback, useEffect, useState } from 'react'

import useAuctionConfig from './useAuctionConfig'
import { getBalanceData } from '../utils/auction'
import { AuctionData } from '../contexts/Auction'
import { getKiraAddress } from '../kira/utils'
import useKira from './useKira'

import useInterval from 'use-interval'
import useTokenInitialSupply from './useTokenInitialSupply'
import testData from './test.json';

const useAuctionData = () => {
  const timeInterval = 60 * 10; // 10 minutes
  const auctionConfig = useAuctionConfig();
  const [auctionData, setAuctionData] = useState<AuctionData>();
  const [intervalAllowed, setIntervalAllowed] = useState(true);
  
  const kira = useKira()
  const kexInitialSupply = useTokenInitialSupply(getKiraAddress(kira))

  useEffect(() => {
    if (auctionConfig && kexInitialSupply) {
      generateInitialData()
    }
  }, [auctionConfig, kexInitialSupply])

  // fetch new data every 5 seconds
  useInterval(async () => {
    if (!!auctionConfig && !!auctionData && intervalAllowed) {
      fetchData()
    }
  }, 5000);

  const getCurrentPrice = (currentTime: number) => {
    let currentPrice: number = 0;
    const TC1: number = currentTime - auctionConfig.epochTime

    if (TC1 >= 0 && TC1 <= auctionConfig.T1) {  // If in T1
      currentPrice = auctionConfig.P2 + (auctionConfig.T1 - TC1) * (auctionConfig.P1 - auctionConfig.P2) / auctionConfig.T1;
    } else if (TC1 > auctionConfig.T1 && TC1 <= auctionConfig.T1 + auctionConfig.T2) { // If in T1 ~ T2
      currentPrice = auctionConfig.P3 + (auctionConfig.T2 + auctionConfig.T1 - TC1) * (auctionConfig.P2 - auctionConfig.P3) / auctionConfig.T2;
    }

    return currentPrice
  }

  const getEstimatedEndTime = (totalRaisedInUSD:number, currentTime: number) => {
    if (!auctionConfig) return;
    if (!kexInitialSupply) return;

    let remainingTime: number = 0;
    const CAP1 = kexInitialSupply.multipliedBy(auctionConfig.P1).toNumber();
    const CAP2 = kexInitialSupply.multipliedBy(auctionConfig.P2).toNumber();
    const CAP3 = kexInitialSupply.multipliedBy(auctionConfig.P3).toNumber();
    const P = getCurrentPrice(currentTime)

    if (totalRaisedInUSD <= CAP3) {
      remainingTime = auctionConfig.T1 + auctionConfig.T2;
    } else if (totalRaisedInUSD <= CAP2) {
      const X2 = (P - auctionConfig.P3) * auctionConfig.T2 / (auctionConfig.P2 - auctionConfig.P3);
      remainingTime = auctionConfig.T1 + (auctionConfig.T2 - X2);
    } else if (totalRaisedInUSD <= CAP1) {
      const X1 = (P - auctionConfig.P2) * auctionConfig.T1 / (auctionConfig.P1 - auctionConfig.P2)
      remainingTime = auctionConfig.T1 - X1;
    }

    return remainingTime;
  }

  const generateInitialData = () => {
    const T2M = auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2;
    const CAP1 = kexInitialSupply.multipliedBy(auctionConfig.P1).toNumber();

    let labels = [] as string[]
    let prices = [] as number[]
    let amounts = [] as number[]

    const now = Date.now() / 1000;

    if (now > T2M) {
      setIntervalAllowed(false)
    }
    
    for (let epochT = auctionConfig.epochTime; epochT <= T2M; epochT += timeInterval) {
      let T = new Date(0);
      T.setUTCSeconds(epochT);

      const hour = T.getUTCHours();
      const minute = T.getUTCMinutes();

      labels.push([(hour > 9 ? '' : '0') + hour, (minute > 9 ? '' : '0') + minute].join(':'));
      prices.push(getCurrentPrice(epochT));
      amounts.push(0);
    }
    
    setAuctionData({
      labels: labels,
      prices: prices,
      amounts: amounts,
      kexPrice: 0,
      ethDeposited: 0,
      totalRaisedInUSD: 0,
      initialMarketCap: CAP1,
      auctionFinished: now > T2M ? true : false
    })
  }

  const fetchData = async () => {
    let amounts = auctionData.amounts;
    let ethDeposited: number = 0;
    let totalRaisedAmount: number = 0;

    const now = Date.now() / 1000;
    const T2M = auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2;

    if (now > T2M) {
      setIntervalAllowed(false);
    }
    
    // const resData = await getBalanceData("kovan", "0x4d097024c88b710e5c4d4207fdc190029db8b91e");
    const resData: any = testData; // Test Data

    if (!resData) {
      console.log("Can't fetch API data");
      setIntervalAllowed(false);
      return;
    }

    if (Object.entries(resData['balances']).length === 0) {
      console.log("No balance data");
      setIntervalAllowed(false);
      return;
    }
    
    // console.log(resData['balances'], now);

    for (let T = auctionConfig.epochTime, index = 0; T <= now; T += timeInterval, index ++) {
      // Sort by epoch difference
      let epoches = Object.keys(resData['balances']);
      
      epoches.sort((key1, key2) => {
        return Math.abs(+key1 - T) - Math.abs(+key2 - T)
      })

      // Find the cloest epoch timestamp
      // let ethAmountRaised: number = Math.abs(+epoches[0] - T) < timeInterval ? +resData['balances'][epoches[0]].amount : 0
      let ethAmountRaised = +resData['balances'][epoches[0]].amount;
      amounts[index] = ethAmountRaised * +resData['usd'];
      if (ethAmountRaised > 0) {
        ethDeposited = ethAmountRaised
      }
    }

    totalRaisedAmount = ethDeposited * +resData['usd'];
    
    setAuctionData({
      labels: auctionData.labels,
      prices: auctionData.prices,
      amounts: amounts,
      kexPrice: getCurrentPrice(now),
      ethDeposited: ethDeposited,
      totalRaisedInUSD: totalRaisedAmount,
      auctionEndTimeLeft: getEstimatedEndTime(totalRaisedAmount, now),
      auctionFinished: now > auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2 ? true : false
    })
  }

  return auctionData;
}

export default useAuctionData
