import {useCallback} from 'react'

import useKira from './useKira'
import {useWallet} from 'use-wallet'

import {leave, getXKiraStakingContract} from '../kira/utils'

const useLeave = () => {
  const {account} = useWallet()
  const kira = useKira()

  const handle = useCallback(
    async (amount: string) => {
      const txHash = await leave(
        getXKiraStakingContract(kira),
        amount,
        account,
      )
      console.log(txHash)
    },
    [account, kira],
  )

  return {onLeave: handle}
}

export default useLeave
