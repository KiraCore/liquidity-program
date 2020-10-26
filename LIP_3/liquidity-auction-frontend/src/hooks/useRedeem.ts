import { useCallback } from 'react'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'
import { redeem } from '../kira/utils'

const useRedeem = (kiraChefContract: Contract) => {
  const { account } = useWallet()

  const handleRedeem = useCallback(async () => {
    const txHash = await redeem(kiraChefContract, account)
    console.log(txHash)
    return txHash
  }, [account, kiraChefContract])

  return { onRedeem: handleRedeem }
}

export default useRedeem
