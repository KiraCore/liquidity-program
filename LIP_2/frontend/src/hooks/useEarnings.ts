import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getEarned, getKiraChefContract } from '../kira/utils'
import useKira from './useKira'
import useBlock from './useBlock'

const useEarnings = (pid: number) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const {
    account,
    ethereum,
  }: { account: string; ethereum: provider } = useWallet()
  const kira = useKira()
  const kiraChefContract = getKiraChefContract(kira)
  const block = useBlock()

  const fetchBalance = useCallback(async () => {
    const balance = await getEarned(kiraChefContract, pid, account)
    setBalance(new BigNumber(balance))
  }, [account, kiraChefContract, kira])

  useEffect(() => {
    if (account && kiraChefContract && kira) {
      fetchBalance()
    }
  }, [account, block, kiraChefContract, setBalance, kira])

  return balance
}

export default useEarnings
