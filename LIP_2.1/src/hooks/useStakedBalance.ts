import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getStakedLP, getKiraStakingContract } from '../kira/utils'
import useKira from './useKira'
import useBlock from './useBlock'

const useStakedBalance = (pid: number) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string } = useWallet()
  const kira = useKira()
  const kiraStakingContract = getKiraStakingContract(kira)
  const block = useBlock()

  const fetchBalance = useCallback(async () => {
    const balance = await getStakedLP(kiraStakingContract, pid, account)
    setBalance(balance)
  }, [account, pid, kira])

  useEffect(() => {
    if (account && kira) {
      fetchBalance()
    }
  }, [account, pid, setBalance, block, kira])

  return balance
}

export default useStakedBalance
