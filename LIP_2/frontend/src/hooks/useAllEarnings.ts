import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getEarned, getKiraChefContract, getFarms } from '../kira/utils'
import useKira from './useKira'
import useBlock from './useBlock'

const useAllEarnings = () => {
  const [balances, setBalance] = useState([] as Array<BigNumber>)
  const { account }: { account: string; ethereum: provider } = useWallet()
  const kira = useKira()
  const farms = getFarms(kira)
  const kiraChefContract = getKiraChefContract(kira)
  const block = useBlock()

  const fetchAllBalances = useCallback(async () => {
    const balances: Array<BigNumber> = await Promise.all(
      farms.map(({ pid }: { pid: number }) =>
        getEarned(kiraChefContract, pid, account),
      ),
    )
    setBalance(balances)
  }, [account, kiraChefContract, kira])

  useEffect(() => {
    if (account && kiraChefContract && kira) {
      fetchAllBalances()
    }
  }, [account, block, kiraChefContract, setBalance, kira])

  return balances
}

export default useAllEarnings
