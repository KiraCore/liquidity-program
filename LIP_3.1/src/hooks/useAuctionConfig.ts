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

    console.log("INFO: Reading config data...");
    config = {
      0: `${resCnf['start']}`, 
      1: `${resCnf['p1']}`, // PRICE IN KEX/ETH
      2: `${resCnf['p2']}`, // PRICE IN KEX/ETH
      3: `${resCnf['p3']}`, // PRICE IN KEX/ETH
      4: `${resCnf['t1']}`,
      5: `${resCnf['t2']}`,
      6: `${resCnf['delay']}`, // min time delta between consecutive ETH transfers
      7: `${resCnf['limit']}`} // max ETH limit per transaction

    let price1 = new BigNumber(parseInt(config[1])).shiftedBy(-18).toNumber(); // PRICE IN KEX/ETH
    let price2 = new BigNumber(parseInt(config[2])).shiftedBy(-18).toNumber(); // PRICE IN KEX/ETH
    let price3 = new BigNumber(parseInt(config[3])).shiftedBy(-18).toNumber(); // PRICE IN KEX/ETH
    let maxEther = new BigNumber(parseInt(config[7])).shiftedBy(-18).toNumber();

    setAuction({
      epochTime: parseInt(config[0]),
      P1: price1, // IN ETH FOR PRICE CALCULATION
      P2: price2, // IN ETH FOR PRICE CALCULATION
      P3: price3, // IN ETH FOR PRICE CALCULATION
      T1: parseInt(config[4]),
      T2: parseInt(config[5]),
      intervalLimit: parseInt(config[6]),
      maxEther: maxEther,
    });
  }, [ethereum, auctionAddress])

  useEffect(() => {
    console.log("Fetch Auction Config...");
    const resCnf: any = cfgData; // Config Data
    
    if (!resCnf) {
      throw new Error("ERROR: Can't fetch Configuration Data");
    }

    /*if (ethereum && auctionAddress || resCnf['test'] == true) {
      fetchAuctionInfo()
    }*/
    fetchAuctionInfo();
    
  }, [ethereum, auctionAddress])

  return auction
}

export default useAuctionConfig
