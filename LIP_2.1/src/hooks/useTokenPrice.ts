import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'
import { useWallet } from 'use-wallet'
import useKira from './useKira'
import useAllInfo from './useAllInfo'
import useBlock from './useBlock'
import { TokenPrice } from '../contexts/TokenPrice'

const useTokenPrice = () => {
  const [tokenPrice, setTokenPrice] = useState<TokenPrice>({ ETH: 0, KEX: 0 });
  const { account }: { account: string; ethereum: provider } = useWallet()
  const kira = useKira()
  const block = useBlock()
  const allInfo = useAllInfo()

  const fetchETHPriceInUSD = useCallback(async () => {
    if (allInfo[0]) {
      // const ethPrice = await getETHPriceInUSD()
      const ethPrice = 595.3
      const kexPrice = allInfo[0].tokenPriceInWeth.multipliedBy(ethPrice).toNumber()

      setTokenPrice({
        ETH: ethPrice,
        KEX: kexPrice,
      })
    }
  }, [account, kira, allInfo])

  useEffect(() => {
    if (account && kira) {
        fetchETHPriceInUSD()
    }
  }, [account, block, setTokenPrice, kira])

  return tokenPrice
}

export default useTokenPrice
