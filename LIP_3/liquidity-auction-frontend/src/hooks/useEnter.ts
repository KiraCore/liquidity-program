import {useCallback} from 'react'

import useKira from './useKira'
import {useWallet} from 'use-wallet'

import {enter, getXKiraStakingContract} from '../kira/utils'

const useEnter = () => {
  const {account} = useWallet()
  const kira = useKira()

  const handle = useCallback(
    async (amount: string) => {
      const txHash = await enter(
        getXKiraStakingContract(kira),
        amount,
        account,
      )
      console.log(txHash)
    },
    [account, kira],
  )

  return {onEnter: handle}
}

export default useEnter
