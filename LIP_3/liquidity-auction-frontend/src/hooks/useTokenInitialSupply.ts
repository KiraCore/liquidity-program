import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { getInitialSupply } from '../utils/kira'

const useTokenInitialSupply = (tokenAddress: string) => {
  const [initialSupply, setInitialSupply] = useState(new BigNumber(0))
  const {
    account,
    ethereum,
  }: { account: string; ethereum: provider } = useWallet()

  const fetchInitialSupply = useCallback(async () => {
    const initialSupply: BigNumber = await getInitialSupply(ethereum, tokenAddress)
    setInitialSupply(initialSupply.dividedBy(new BigNumber(10).pow(6)))
  }, [account, ethereum, tokenAddress])

  useEffect(() => {
    if (account && ethereum) {
      fetchInitialSupply()
    }
  }, [account, ethereum, setInitialSupply, tokenAddress])

  return initialSupply
}

export default useTokenInitialSupply
