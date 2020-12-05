import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getStakedLP, getKiraStakingContract } from '../kira/utils'
import useKira from './useKira'
import useBlock from './useBlock'

const useStakedLPBalance = () => {
  const [balance, setBalance] = useState(new BigNumber(-1))
  const { account }: { account: string } = useWallet()
  const kira = useKira()
  const kiraStakingContract = getKiraStakingContract(kira)
  const block = useBlock()

  const fetchBalance = useCallback(async () => {
    const balance = await getStakedLP(kiraStakingContract, account)
    setBalance(balance)
  }, [account, kira])

  useEffect(() => {
    if (account && kira) {
      fetchBalance()
    }
  }, [account, setBalance, block, kira])

  return balance
}

export default useStakedLPBalance
