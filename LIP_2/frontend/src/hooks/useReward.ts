import { useCallback } from 'react'

import useKira from './useKira'
import { useWallet } from 'use-wallet'

import { harvest, getKiraChefContract } from '../kira/utils'

const useReward = (pid: number) => {
  const { account } = useWallet()
  const kira = useKira()
  const kiraChefContract = getKiraChefContract(kira)

  const handleReward = useCallback(async () => {
    const txHash = await harvest(kiraChefContract, pid, account)
    console.log(txHash)
    return txHash
  }, [account, pid, kira])

  return { onReward: handleReward }
}

export default useReward
