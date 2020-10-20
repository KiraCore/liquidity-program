import {useCallback} from 'react'

import useSquid from './useSquid'
import {useWallet} from 'use-wallet'

import {leave, getXSquidStakingContract} from '../squid/utils'

const useLeave = () => {
  const {account} = useWallet()
  const squid = useSquid()

  const handle = useCallback(
    async (amount: string) => {
      const txHash = await leave(
        getXSquidStakingContract(squid),
        amount,
        account,
      )
      console.log(txHash)
    },
    [account, squid],
  )

  return {onLeave: handle}
}

export default useLeave
