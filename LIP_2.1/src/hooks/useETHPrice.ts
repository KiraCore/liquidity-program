import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'
import { useWallet } from 'use-wallet'
import { getETHPriceInUSD } from '../utils'
import useKira from './useKira'
import useBlock from './useBlock'

const useETHPriceInUSD = () => {
  const [ethPrice, setEthPrice] = useState(0)
  const { account }: { account: string; ethereum: provider } = useWallet()
  const kira = useKira()
  const block = useBlock()

  const fetchETHPriceInUSD = useCallback(async () => {
    const price = await getETHPriceInUSD()
    // const price = 5;
    setEthPrice(price)
  }, [account, kira])

  useEffect(() => {
    if (account && kira) {
        fetchETHPriceInUSD()
    }
  }, [account, block, setEthPrice, kira])

  return ethPrice
}

export default useETHPriceInUSD
