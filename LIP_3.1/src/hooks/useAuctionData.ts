import { useCallback, useEffect, useState } from 'react'

import useAuctionConfig from './useAuctionConfig'
import { getBalanceData } from '../utils/auction'
import { AuctionData } from '../contexts/Auction'
import { getKiraAddress } from '../kira/utils'
import useKira from './useKira'
import BigNumber from 'bignumber.js'
import useInterval from 'use-interval'
import useTokenInitialSupply from './useTokenInitialSupply'
import cfgData from '../config.json';
import testData from '../test.json';

const useAuctionData = () => {
  const resCnf: any = cfgData; // Config Data
  const timeInterval = 60 * 10; // 10 minutes
  const auctionConfig = useAuctionConfig();
  const [auctionData, setAuctionData] = useState<AuctionData>();
  const [xLabels, setLabels] = useState([]);
  const [pPrices, setPrices] = useState([]);
  const [genFinished, setGenFinished] = useState(false);
  const [intervalAllowed, setIntervalAllowed] = useState(true);
  
  const kexInitialSupply = useTokenInitialSupply()
  const availableKEX: number = +resCnf["available"]; // Maximum number of KEX available for distribution via the Liquidity Auction

  useEffect(() => {
    console.log("Fetch Auction Data...");
    if (auctionConfig && kexInitialSupply && !genFinished && intervalAllowed) {
      generateInitialData()
    }
  }, [auctionConfig, kexInitialSupply, genFinished])

  // fetch new data every 5 seconds
  useInterval(async () => {
    console.log(`Interval running [${!!auctionConfig}, ${!!auctionData}, ${intervalAllowed}]...`);
    if (!!auctionConfig && !!auctionData && intervalAllowed) {
      fetchData()
    }
  }, 5000);

  const getCurrentPrice = (currentTime: number) => {
    let currentPrice: number = 0;

    // time delta between start of the auction and current time
    const dT: number = currentTime - auctionConfig.epochTime

    if (dT <= 0) { // if auction didn't started yet then current price is MAX
        return auctionConfig.P1; // edge cases must be explicit
    }

    if (dT > (auctionConfig.T1 + auctionConfig.T2)) { // at the auction ended then price is MIN
      return auctionConfig.P3;  // edge cases must be explicit
    }

    if (dT > 0 && dT <= auctionConfig.T1) { // If in T1
      currentPrice = auctionConfig.P2 + (((auctionConfig.T1 - dT) * (auctionConfig.P1 - auctionConfig.P2)) / auctionConfig.T1);
    } else if (dT > auctionConfig.T1) { // If in T1 ~ T2
      currentPrice = auctionConfig.P3 + (((auctionConfig.T2 + auctionConfig.T1 - dT) * (auctionConfig.P2 - auctionConfig.P3)) / auctionConfig.T2);
    }

    return currentPrice
  }

  const getEstimatedEndCAP = (currentTime: number) => {
    return (availableKEX * getCurrentPrice(currentTime));
  }

  const getEstimatedTimeLeft = (totalRaisedETH:number, currentTime: number) => {
    if (!auctionConfig) return;
    const dT: number = currentTime - auctionConfig.epochTime

    if (dT <= 0) { // if auction didn't started yet then time remaining is MAX possible
        return (auctionConfig.T1 + auctionConfig.T2); // edge cases must be explicit
    }

    if (dT >= (auctionConfig.T1 + auctionConfig.T2)) { // at the auction ended then time remaining is 0
      return 0;  // edge cases must be explicit
    }

    let remainingTime: number = 0;
    const CAP1 = availableKEX * auctionConfig.P1; // absolute maximum that can be sold (ETH)
    const CAP2 = availableKEX * auctionConfig.P2; 
    const CAP3 = availableKEX * auctionConfig.P3; // lowest possible hard cap for the auction
    const P = getCurrentPrice(currentTime);       // current Hard CAP price KEX/ETH

    if (totalRaisedETH <= CAP3) {
      remainingTime = auctionConfig.T1 + auctionConfig.T2;
    } else if (totalRaisedETH <= CAP2) {
      const X2 = ((P - auctionConfig.P3) * auctionConfig.T2) / (auctionConfig.P2 - auctionConfig.P3);
      remainingTime = auctionConfig.T1 + (auctionConfig.T2 - X2);
    } else if (totalRaisedETH <= CAP1) {
      const X1 = (P - auctionConfig.P2) * auctionConfig.T1 / (auctionConfig.P1 - auctionConfig.P2)
      remainingTime = auctionConfig.T1 - X1;
    }

    return remainingTime;
  }

  const generateInitialData = () => {
    const now = Date.now() / 1000;
    const T2M = auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2;
    const CAP1 = availableKEX * auctionConfig.P1;

    let labels = [] as string[]
    let prices = [] as number[]
    let amounts = [] as number[]

    if (now > T2M) {
      setIntervalAllowed(false)
    }
    
    for (let epochT = auctionConfig.epochTime; epochT <= T2M; epochT += timeInterval) {
      let T = new Date(0);
      T.setSeconds(epochT);
      
      let month = T.getUTCMonth() + 1;
      let day = T.getUTCDate();
      let hour = T.getUTCHours();
      let minute =T.getUTCMinutes();
      let second = T.getUTCSeconds();

      day = day ? day : 0;
      hour = hour ? hour : 0;
      minute = minute ? minute : 0;
      second = second ? second : 0;
      labels.push([(hour > 9 ? '' : '0') + hour, (minute > 9 ? '' : '0') + minute, (second > 9 ? '' : '0') + second + ", " + month + "/" + (day) + " "].join(':'));
      prices.push(getCurrentPrice(epochT) * +resCnf['ethusd']);
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
    setGenFinished(true);
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
    const estimatedEndCapETH = getEstimatedEndCAP(now);
    const estimatedEndCAP = estimatedEndCapETH* +resCnf['ethusd']; // IN USD
    const timeLeft = getEstimatedTimeLeft(ethDeposited, now);
    const CAP3 = availableKEX * auctionConfig.P3;

    if (now > T2M) {
      setIntervalAllowed(false);
    }

    let fetchResult;
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

    
    let startTime = auctionConfig.epochTime; // auction start
    let endTime = auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2; // auction end
    for (let T = startTime, index = 0; T < (endTime + timeInterval); T += timeInterval, index++) { // (endTime + timeInterval) is used to include latest frame - otherwise we will have empty screen for the first 10 minutes
      // Sort by epoch difference
      let epoches = Object.keys(resData['balances']);
      
      epoches.sort((key1, key2) => {
        return Math.abs(+key1 - T) - Math.abs(+key2 - T)
      })

      // Find the cloest epoch timestamp
      let ethAmountRaised: number = Math.abs(+epoches[0] - T) < timeInterval ? +resData['balances'][epoches[0]].amount : 0
      // let ethAmountRaised = +resData['balances'][epoches[0]].amount;
      
      let cap = getEstimatedEndCAP(T); // contract does not allow deposits above the cap
      if (T > now) { // nothing could have been raised if auction didn't started yet
        ethAmountRaised = ethDeposited; // recover last valid value
      }

      amounts[index] = ethAmountRaised;
      prices[index] = pPrices && pPrices[index];
      labels[index] = labels && xLabels[index];

      if (ethAmountRaised > ethDeposited) { // lets find the largest sum of ETH that was ever deposited 
        ethDeposited = ethAmountRaised
      }
    }

    totalRaisedAmount = ethDeposited * +resCnf['ethusd'];

    console.log("TOTAL RAISED ETH AMOUNT: ", ethDeposited, totalRaisedAmount, estimatedEndCAP, currentKexPrice);
    if (startTime < now &&  totalRaisedAmount > estimatedEndCAP) { // Finishes the auction when raised amount is over the estimated end cap AND auction started
      setIntervalAllowed(false);
      console.log("Auction finished", auctionData.ethDeposited);
    }

    setAuctionData({
      labels: totalRaisedAmount > CAP3 ? labels : xLabels,
      prices: totalRaisedAmount > CAP3 ? prices : pPrices,
      amounts: amounts,
      kexPrice: currentKexPrice * +resCnf['ethusd'],
      ethDeposited: ethDeposited,
      totalRaisedInUSD: totalRaisedAmount,
      auctionEndTimeLeft: getEstimatedTimeLeft(ethDeposited, now),
      auctionEndCAP: estimatedEndCAP, // IN USD
      auctionFinished: now > auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2 || totalRaisedAmount > estimatedEndCAP ? true : false
    })
  }

  return auctionData;
}

export default useAuctionData
