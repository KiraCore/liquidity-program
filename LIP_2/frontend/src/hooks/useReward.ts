import { useCallback } from 'react'

import useSquid from './useSquid'
import { useWallet } from 'use-wallet'

import { harvest, getSquidChefContract } from '../squid/utils'

const useReward = (pid: number) => {
  const { account } = useWallet()
  const squid = useSquid()
  const squidChefContract = getSquidChefContract(squid)

  const handleReward = useCallback(async () => {
    const txHash = await harvest(squidChefContract, pid, account)
    console.log(txHash)
    return txHash
  }, [account, pid, squid])

  return { onReward: handleReward }
}

export default useReward
