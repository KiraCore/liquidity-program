import { useCallback } from 'react'

import useKira from './useKira'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { Contract } from 'web3-eth-contract'

import { approve, getKiraStakingContract } from '../kira/utils'

const useApprove = (lpContract: Contract) => {
  const { account }: { account: string; ethereum: provider } = useWallet()
  const kira = useKira()
  const kiraStakingContract = getKiraStakingContract(kira)

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(lpContract, kiraStakingContract, account)
      return tx
    } catch (e) {
      return false
    }
  }, [account, lpContract, kiraStakingContract])

  return { onApprove: handleApprove }
}

export default useApprove
