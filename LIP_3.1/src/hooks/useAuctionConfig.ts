import { useCallback, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { getAuctionConfig } from '../utils/auction'
import { getKiraAuctionAddress } from '../kira/utils'
import { AuctionInfo } from '../contexts/Auction'
import useKira from '../hooks/useKira'
import BigNumber from 'bignumber.js'
import cfgData from '../config.json';

const useAuctionConfig = () => {
  const kira = useKira();
  const auctionAddress = getKiraAuctionAddress(kira);
  const [auction, setAuction] = useState<AuctionInfo>();
  const {
    ethereum,
  }: { account: string; ethereum: provider } = useWallet()
 
  const fetchAuctionInfo = useCallback(async () => {

    const resCnf: any = cfgData; // Config Data
    let config;

    if (!resCnf) {
      throw new Error("ERROR: Can't fetch Configuration Data");
    }

    if(resCnf['test'] == true){ // LOCAL TESTING DATA ../config.json
      console.log("INFO: Fetching contract mock data...");
      config = {
        0: `${resCnf['start']}`, 
        1: `${resCnf['p1']}`,
        2: `${resCnf['p2']}`,
        3: `${resCnf['p3']}`,
        4: `${resCnf['t1']}`,
        5: `${resCnf['t2']}`,
        6: `${resCnf['delay']}`, // min time delta between consecutive ETH transfers
        7: `${resCnf['limit']}`} // max ETH limit per transaction
    } else { // PRODUCTION DATA
      console.log(`INFO: Fetching contract data ${auctionAddress}...`);
      config = await getAuctionConfig(ethereum, auctionAddress);
    }

    console.log("INFO: Contract data:");
    console.log(config);

    let price1 = new BigNumber(parseInt(config[1])).shiftedBy(-18).toNumber();
    let price2 = new BigNumber(parseInt(config[2])).shiftedBy(-18).toNumber();
    let price3 = new BigNumber(parseInt(config[3])).shiftedBy(-18).toNumber();
    let maxEther = new BigNumber(parseInt(config[7])).shiftedBy(-18).toNumber();

    setAuction({
      epochTime: parseInt(config[0]),
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
