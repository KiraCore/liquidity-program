import { useCallback, useState, useEffect } from 'react'
import { getETHPriceInUSD } from '../utils'

const useETHPrice = () => {
  const [ethPrice, setETHPrice] = useState<number>(0);

  const fetchETHPriceInUSD = useCallback(async () => {
      const prices = await getETHPriceInUSD()
      setETHPrice(prices['price_usd'])
  }, [])

  useEffect(() => {
    fetchETHPriceInUSD()
  }, [])

  return ethPrice
}

export default useETHPrice
