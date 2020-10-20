import { useCallback } from 'react'

import useSquid from './useSquid'
import { useWallet } from 'use-wallet'

import { unstake, getSquidChefContract } from '../squid/utils'

const useUnstake = (pid: number) => {
  const { account } = useWallet()
  const squid = useSquid()
  const squidChefContract = getSquidChefContract(squid)

  const handleUnstake = useCallback(
    async (amount: string) => {
      const txHash = await unstake(squidChefContract, pid, amount, account)
      console.log(txHash)
    },
    [account, pid, squid],
  )

  return { onUnstake: handleUnstake }
}

export default useUnstake
