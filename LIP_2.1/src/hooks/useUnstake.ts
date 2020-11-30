import { useCallback } from 'react'

import useKira from './useKira'
import { useWallet } from 'use-wallet'

import { unstake, getKiraStakingContract } from '../kira/utils'

const useUnstake = (pid: number) => {
  const { account } = useWallet()
  const kira = useKira()
  const kiraStakingContract = getKiraStakingContract(kira)

  const handleUnstake = useCallback(
    async (amount: string) => {
      const txHash = await unstake(kiraStakingContract, pid, amount, account)
      console.log(txHash)
    },
    [account, pid, kira],
  )

  return { onUnstake: handleUnstake }
}

export default useUnstake
