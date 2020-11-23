import { useEffect, useState } from 'react'

import useAuctionConfig from './useAuctionConfig'
import { getBalanceData } from '../utils/auction'
import { AuctionData } from '../contexts/Auction'
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

    if ( dT == auctionConfig.T1 ) {
      return auctionConfig.P2; // edge cases must be explicit
    }

    if (dT >= (auctionConfig.T1 + auctionConfig.T2)) { // at the auction ended then price is MIN
      return auctionConfig.P3;  // edge cases must be explicit
    }

    if (dT > 0 && dT < auctionConfig.T1) { // If dT in (0, T1)
      currentPrice = auctionConfig.P2 + (((auctionConfig.T1 - dT) * (auctionConfig.P1 - auctionConfig.P2)) / auctionConfig.T1);
    } else if (dT > auctionConfig.T1) { // If dT in (T1, T2)
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
      return (Math.abs(dT) + auctionConfig.T1 + auctionConfig.T2); // edge cases must be explicit
    }

    for(let i = auctionConfig.epochTime; i <= (auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2); i++) {
      let pTMP = getCurrentPrice(i);
      let hcTMP = pTMP*availableKEX;
      if( hcTMP <= totalRaisedETH ){
          return i - currentTime; // hard cap was hit at i
      }
    }

    return (auctionConfig.T1 + auctionConfig.T2) - dT;
  }

  const generateInitialData = () => {
    const now = Date.now() / 1000;
    const T2M = auctionConfig.epochTime + auctionConfig.T1 + auctionConfig.T2;
    const CAP1 = availableKEX * auctionConfig.P1;

    let labels = [] as string[]
    let prices = [] as number[]
    let amounts = [] as number[]

    /*if (now > T2M) {
      setIntervalAllowed(false)
    }*/
    
    for (let epochT = auctionConfig.epochTime; epochT <= T2M;) {
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
      epochT += timeInterval
    }
    
    setPrices(prices);
    setLabels(labels);
    setAuctionData({
      labels: labels,
      prices: prices,
      amounts: amounts,
      kexPrice: 0,
      projectedKexPrice: 0,
      ethDeposited: 0,
      totalRaisedInUSD: 0,
      projectedEndTime: T2M,
      initialMarketCap: CAP1,
      auctionStarted: now >= auctionConfig.epochTime ? true : false,
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

    let now = Date.now() / 1000;
    let ethusd = +resCnf['ethusd'];
    let startTime = auctionConfig.epochTime; // auction start
    let endTime = startTime + auctionConfig.T1 + auctionConfig.T2;
    
    /*if (now > endTime) {
      setIntervalAllowed(false);
    }*/

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
    
    let projectedEndTime = endTime;
    let projectedEndPrice = auctionConfig.P3;
    let T = startTime;
    for (let index = 0; T <= endTime; index++) { // (endTime + timeInterval) is used to include latest frame - otherwise we will have empty screen for the first 10 minutes
      // Sort by epoch difference

      let lastEpoch = 0;
      Object.keys(resData['balances']).forEach(function(key) {
        let kval = +key;
        if (kval > lastEpoch && kval < (T + timeInterval)) { // find oldest epoch smaller than (T + interval)
          lastEpoch = kval;
        }
      });

      let ethAmountRaised: number = lastEpoch > 0 ? +resData['balances'][lastEpoch].amount : 0
      let cap = getEstimatedEndCAP(T); // contract does not allow deposits above the cap
      if (T > now || ethAmountRaised > cap) { // nothing could have been raised if auction didn't started yet
        ethAmountRaised = ethDeposited; // recover last valid value
      }

      if (ethAmountRaised > ethDeposited) { // lets find the largest sum of ETH that was ever deposited 
        ethDeposited = ethAmountRaised
      }

      let hardCap = availableKEX * getCurrentPrice(T);
      let timeLeft = getEstimatedTimeLeft(ethDeposited, T);

      //console.log(`Time Left: T:${T} -> ${timeLeft}`);
      if (timeLeft < 0 || ethAmountRaised > hardCap || (T + timeInterval) > now) {
        amounts[index] = 0; // do not display amounts after auction finalized or if frame is not live yet, or if current hard cap is hit
      } else {
        amounts[index] = ethAmountRaised;
        projectedEndTime =  T + timeLeft; // estimate auction end
        projectedEndPrice = getCurrentPrice(projectedEndTime); // estimate final price
      }

      prices[index] = pPrices && pPrices[index];
      labels[index] = labels && xLabels[index];
      T += timeInterval; 
    }

    totalRaisedAmount = ethDeposited * ethusd;

    let timeLast = Math.min(projectedEndTime, now);
    let currentKexPrice = getCurrentPrice(timeLast);
    if ( now >= projectedEndTime) { // if auction ended - show final price
      currentKexPrice = projectedEndPrice;
    }

    let timeRemaining = getEstimatedTimeLeft(ethDeposited, now);
    let estimatedEndCapETH = getEstimatedEndCAP(projectedEndTime); // Projected CMC must be at projected time
    let estimatedEndCAP = estimatedEndCapETH * ethusd; // Projected CMC in USD
    let currentKexPriceUSD = currentKexPrice * ethusd;
    let projectedEndPriceUSD = projectedEndPrice * ethusd;

    console.log(`INFO:   Total raised: ${ethDeposited} ETH / ${totalRaisedAmount} USD`);
    console.log(`INFO: Last KEX price: ${currentKexPrice} ETH / ${currentKexPriceUSD} USD`);
    console.log(`INFO: Proj KEX price: ${projectedEndPrice} ETH / ${projectedEndPriceUSD} USD`);
    console.log(`INFO:  Projected Cap: ${estimatedEndCapETH} ETH / ${estimatedEndCAP} USD`);

    console.log(`INFO:     Start Time: ${startTime}`);
    console.log(`INFO:       Now Time: ${now}`);
    console.log(`INFO: Projected Time: ${projectedEndTime}`);
    console.log(`INFO:       End Time: ${endTime}`);

    /*if (timeRemaining <= 0) { // Finishes the auction when time remaining is 0
      setIntervalAllowed(false);
      console.log("Auction finished", auctionData.ethDeposited);
    }*/

    let CAP3 = availableKEX * auctionConfig.P3;

    setAuctionData({
      labels: totalRaisedAmount > CAP3 ? labels : xLabels,
      prices: totalRaisedAmount > CAP3 ? prices : pPrices,
      amounts: amounts,
      kexPrice: currentKexPriceUSD,
      projectedKexPrice: projectedEndPriceUSD,
      ethDeposited: ethDeposited,
      totalRaisedInUSD: totalRaisedAmount,
      projectedEndTime: projectedEndTime,
      auctionEndTimeLeft: timeRemaining,
      auctionEndCAP: estimatedEndCAP, // IN USD
      auctionStarted: now >= startTime ? true : false,
      auctionFinished: timeRemaining <= 0 ? true : false
    })
  }

  return auctionData;
}

export default useAuctionData
