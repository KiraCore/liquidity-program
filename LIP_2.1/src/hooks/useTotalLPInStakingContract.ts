import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getKiraStakingContract, getTotalLPInStaking } from '../kira/utils'
import useKira from './useKira'
import useBlock from './useBlock'

const useTotalLPInStakingContract = () => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string; ethereum: provider } = useWallet()
  const kira = useKira()
  const kiraStakingContract = getKiraStakingContract(kira)
  const block = useBlock()

  const fetchBalance = useCallback(async () => {
    const balance = await getTotalLPInStaking(kiraStakingContract)
    setBalance(new BigNumber(balance))
  }, [account, kiraStakingContract, kira])

  useEffect(() => {
    if (account && kiraStakingContract && kira) {
      fetchBalance()
    }
  }, [account, block, kiraStakingContract, setBalance, kira])

  return balance
}

export default useTotalLPInStakingContract
