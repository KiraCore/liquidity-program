import { useCallback } from 'react'

import useSquid from './useSquid'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { Contract } from 'web3-eth-contract'

import { approve, getSquidChefContract } from '../squid/utils'

const useApprove = (lpContract: Contract) => {
  const { account }: { account: string; ethereum: provider } = useWallet()
  const squid = useSquid()
  const squidChefContract = getSquidChefContract(squid)

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(lpContract, squidChefContract, account)
      return tx
    } catch (e) {
      return false
    }
  }, [account, lpContract, squidChefContract])

  return { onApprove: handleApprove }
}

export default useApprove
