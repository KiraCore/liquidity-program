import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getEarned, getSquidChefContract, getFarms } from '../squid/utils'
import useSquid from './useSquid'
import useBlock from './useBlock'

const useAllEarnings = () => {
  const [balances, setBalance] = useState([] as Array<BigNumber>)
  const { account }: { account: string; ethereum: provider } = useWallet()
  const squid = useSquid()
  const farms = getFarms(squid)
  const squidChefContract = getSquidChefContract(squid)
  const block = useBlock()

  const fetchAllBalances = useCallback(async () => {
    const balances: Array<BigNumber> = await Promise.all(
      farms.map(({ pid }: { pid: number }) =>
        getEarned(squidChefContract, pid, account),
      ),
    )
    setBalance(balances)
  }, [account, squidChefContract, squid])

  useEffect(() => {
    if (account && squidChefContract && squid) {
      fetchAllBalances()
    }
  }, [account, block, squidChefContract, setBalance, squid])

  return balances
}

export default useAllEarnings
