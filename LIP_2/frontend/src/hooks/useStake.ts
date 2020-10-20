import { useCallback } from 'react'

import useSquid from './useSquid'
import { useWallet } from 'use-wallet'

import { stake, getSquidChefContract } from '../squid/utils'

const useStake = (pid: number) => {
  const { account } = useWallet()
  const squid = useSquid()

  const handleStake = useCallback(
    async (amount: string) => {
      const txHash = await stake(
        getSquidChefContract(squid),
        pid,
        amount,
        account,
      )
      console.log(txHash)
    },
    [account, pid, squid],
  )

  return { onStake: handleStake }
}

export default useStake
