import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getStaked, getSquidChefContract } from '../squid/utils'
import useSquid from './useSquid'
import useBlock from './useBlock'

const useStakedBalance = (pid: number) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string } = useWallet()
  const squid = useSquid()
  const squidChefContract = getSquidChefContract(squid)
  const block = useBlock()

  const fetchBalance = useCallback(async () => {
    const balance = await getStaked(squidChefContract, pid, account)
    setBalance(new BigNumber(balance))
  }, [account, pid, squid])

  useEffect(() => {
    if (account && squid) {
      fetchBalance()
    }
  }, [account, pid, setBalance, block, squid])

  return balance
}

export default useStakedBalance
