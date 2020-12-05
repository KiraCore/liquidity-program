import { useCallback } from 'react'

import useKira from './useKira'
import { useWallet } from 'use-wallet'

import { harvest, getKiraStakingContract } from '../kira/utils'

const useReward = (pid: number) => {
  const { account } = useWallet()
  const kira = useKira()
  const kiraStakingContract = getKiraStakingContract(kira)

  const handleReward = useCallback(async () => {
    const txHash = await harvest(kiraStakingContract, pid, account)
    return txHash
  }, [account, pid, kira])

  return { onReward: handleReward }
}

export default useReward
