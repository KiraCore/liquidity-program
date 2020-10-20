import {useCallback} from 'react'

import useSquid from './useSquid'
import {useWallet} from 'use-wallet'

import {enter, getXSquidStakingContract} from '../squid/utils'

const useEnter = () => {
  const {account} = useWallet()
  const squid = useSquid()

  const handle = useCallback(
    async (amount: string) => {
      const txHash = await enter(
        getXSquidStakingContract(squid),
        amount,
        account,
      )
      console.log(txHash)
    },
    [account, squid],
  )

  return {onEnter: handle}
}

export default useEnter
