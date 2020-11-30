import { useCallback } from 'react'

import useKira from './useKira'
import { useWallet } from 'use-wallet'

import { stake, getKiraStakingContract } from '../kira/utils'

const useStake = (pid: number) => {
  const { account } = useWallet()
  const kira = useKira()

  const handleStake = useCallback(
    async (amount: string) => {
      const txHash = await stake(
        getKiraStakingContract(kira),
        pid,
        amount,
        account,
      )
      console.log(txHash)
    },
    [account, pid, kira],
  )

  return { onStake: handleStake }
}

export default useStake
