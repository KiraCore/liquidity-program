import { useEffect, useState } from 'react'

import { getAuctionConfig } from '../kira/utils'
import useKira from '../hooks/useKira'

const useAuction = () => {
  const kira = useKira()
  const auctionConfig = getAuctionConfig(kira)
 
  useEffect(() => {
      console.log(auctionConfig);
  }, [auctionConfig])

  return true;
}

export default useAuction
