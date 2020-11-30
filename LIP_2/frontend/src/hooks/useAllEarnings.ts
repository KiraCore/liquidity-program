import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getEarned, getKiraStakingContract, getFarms } from '../kira/utils'
import useKira from './useKira'
import useBlock from './useBlock'

const useAllEarnings = () => {
  const [balances, setBalance] = useState([] as Array<BigNumber>)
  const { account }: { account: string; ethereum: provider } = useWallet()
  const kira = useKira()
  const farms = getFarms(kira)
  const kiraStakingContract = getKiraStakingContract(kira)
  const block = useBlock()

  const fetchAllBalances = useCallback(async () => {
    const balances: Array<BigNumber> = await Promise.all(
      farms.map(({ pid }: { pid: number }) =>
        getEarned(kiraStakingContract, pid, account),
      ),
    )
    setBalance(balances)
  }, [account, kiraStakingContract, kira])

  useEffect(() => {
    if (account && kiraStakingContract && kira) {
      fetchAllBalances()
    }
  }, [account, block, kiraStakingContract, setBalance, kira])

  return balances
}

export default useAllEarnings
