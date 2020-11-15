import { useCallback, useEffect, useState } from 'react'

import useAuctionConfig from './useAuctionConfig'
import { getBalanceData } from '../utils/auction'
import { AuctionData } from '../contexts/Auction'
import { getKiraAddress } from '../kira/utils'
import useKira from './useKira'

import useInterval from 'use-interval'
import useTokenInitialSupply from './useTokenInitialSupply'
import cfgData from '../config.json';
import testData from '../test.json';

const useAuctionData = () => {
  const timeInterval = 60 * 10; // 10 minutes
  const auctionConfig = useAuctionConfig();
  const [auctionData, setAuctionData] = useState<AuctionData>();
  const [xLabels, setLabels] = useState([]);
  const [pPrices, setPrices] = useState([]);
  const [intervalAllowed, setIntervalAllowed] = useState(true);
  
  const kira = useKira()
  const kexInitialSupply = useTokenInitialSupply()

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
    
    setPrices(prices);
    setLabels(labels);

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
    let labels = [] as string[]
    let prices = [] as number[]
    let amounts = [] as number[]
    
    let ethDeposited: number = 0;
    let totalRaisedAmount: number = 0;

    const now = Date.now() / 1000;
    const T2M = auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2;
    const currentKexPrice = getCurrentPrice(now);
    const CAP3 = kexInitialSupply.multipliedBy(auctionConfig.P3).toNumber();

    if (now > T2M) {
      setIntervalAllowed(false);
    }

    const resCnf: any = cfgData; // Config Data
    let fetchResult;

    if (!resCnf) {
      throw new Error("ERROR: Can't fetch Configuration Data");
    }

    if(resCnf['test'] == true){ // LOCAL TESTING DATA ./test.json
      console.log("INFO: Fetching mock data...");
      fetchResult = testData;
    } else { // PRODUCTION DATA
      console.log(`INFO: Fetching production data from ${resCnf['oracle']}, network ${resCnf['network']}, addr: ${resCnf['deposit']}...`);
      fetchResult = await getBalanceData(resCnf['oracle'], resCnf['network'], resCnf['deposit']);
    }

    const resData: any = fetchResult;

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
    
    console.log(`INFO: Current account balance: ${resData['latest']['amount']}ETH`);
    
    for (let T = auctionConfig.epochTime, index = 0; T <= now; T += timeInterval, index ++) {
      // Sort by epoch difference
      let epoches = Object.keys(resData['balances']);
      
      epoches.sort((key1, key2) => {
        return Math.abs(+key1 - T) - Math.abs(+key2 - T)
      })

      // Find the cloest epoch timestamp
      // let ethAmountRaised: number = Math.abs(+epoches[0] - T) < timeInterval ? +resData['balances'][epoches[0]].amount : 0
      let ethAmountRaised = +resData['balances'][epoches[0]].amount;
      if (auctionData.prices[index] >= currentKexPrice) {
        amounts[index] = ethAmountRaised * +resData['usd'];
        prices[index] = pPrices && pPrices[index];
        labels[index] = labels && xLabels[index];
      }
      if (ethAmountRaised > 0) {
        ethDeposited = ethAmountRaised
      }
    }

    totalRaisedAmount = ethDeposited * +resData['usd'];
    
    setAuctionData({
      labels: totalRaisedAmount > CAP3 ? labels : xLabels,
      prices: totalRaisedAmount > CAP3 ? prices : pPrices,
      amounts: amounts,
      kexPrice: currentKexPrice,
      ethDeposited: ethDeposited,
      totalRaisedInUSD: totalRaisedAmount,
      auctionEndTimeLeft: getEstimatedEndTime(totalRaisedAmount, now),
      auctionFinished: now > auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2 ? true : false
    })
  }

  return auctionData;
}

export default useAuctionData
