import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getEarned, getSquidChefContract } from '../squid/utils'
import useSquid from './useSquid'
import useBlock from './useBlock'

const useEarnings = (pid: number) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const {
    account,
    ethereum,
  }: { account: string; ethereum: provider } = useWallet()
  const squid = useSquid()
  const squidChefContract = getSquidChefContract(squid)
  const block = useBlock()

  const fetchBalance = useCallback(async () => {
    const balance = await getEarned(squidChefContract, pid, account)
    setBalance(new BigNumber(balance))
  }, [account, squidChefContract, squid])

  useEffect(() => {
    if (account && squidChefContract && squid) {
      fetchBalance()
    }
  }, [account, block, squidChefContract, setBalance, squid])

  return balance
}

export default useEarnings
