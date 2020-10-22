import {useCallback} from 'react'

import useKira from './useKira'
import {useWallet} from 'use-wallet'
import {provider} from 'web3-core'
import {
  approve,
  getKiraContract,
  getXKiraStakingContract
} from '../kira/utils'

const useApproveStaking = () => {
  const {account}: { account: string; ethereum: provider } = useWallet()
  const kira = useKira()
  const lpContract = getKiraContract(kira)
  const contract = getXKiraStakingContract(kira)

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(lpContract, contract, account)
      return tx
    } catch (e) {
      return false
    }
  }, [account, lpContract, contract])

  return {onApprove: handleApprove}
}

export default useApproveStaking
