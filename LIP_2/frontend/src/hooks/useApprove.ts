import { useCallback } from 'react'

import useKira from './useKira'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { Contract } from 'web3-eth-contract'

import { approve, getKiraChefContract } from '../kira/utils'

const useApprove = (lpContract: Contract) => {
  const { account }: { account: string; ethereum: provider } = useWallet()
  const kira = useKira()
  const kiraChefContract = getKiraChefContract(kira)

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(lpContract, kiraChefContract, account)
      return tx
    } catch (e) {
      return false
    }
  }, [account, lpContract, kiraChefContract])

  return { onApprove: handleApprove }
}

export default useApprove
