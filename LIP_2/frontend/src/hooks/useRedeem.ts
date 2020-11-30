import { useCallback } from 'react'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'
import { redeem } from '../kira/utils'

const useRedeem = (kiraStakingContract: Contract) => {
  const { account } = useWallet()

  const handleRedeem = useCallback(async () => {
    const txHash = await redeem(kiraStakingContract, account)
    console.log(txHash)
    return txHash
  }, [account, kiraStakingContract])

  return { onRedeem: handleRedeem }
}

export default useRedeem
