import {useCallback} from 'react'

import useSquid from './useSquid'
import {useWallet} from 'use-wallet'
import {provider} from 'web3-core'
import {
  approve,
  getSquidContract,
  getXSquidStakingContract
} from '../squid/utils'

const useApproveStaking = () => {
  const {account}: { account: string; ethereum: provider } = useWallet()
  const squid = useSquid()
  const lpContract = getSquidContract(squid)
  const contract = getXSquidStakingContract(squid)

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
