import { useCallback } from 'react'

import useKira from './useKira'
import { useWallet } from 'use-wallet'

import { unstake, getKiraChefContract } from '../kira/utils'

const useUnstake = (pid: number) => {
  const { account } = useWallet()
  const kira = useKira()
  const kiraChefContract = getKiraChefContract(kira)

  const handleUnstake = useCallback(
    async (amount: string) => {
      const txHash = await unstake(kiraChefContract, pid, amount, account)
      console.log(txHash)
    },
    [account, pid, kira],
  )

  return { onUnstake: handleUnstake }
}

export default useUnstake
