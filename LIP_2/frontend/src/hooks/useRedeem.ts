import { useCallback } from 'react'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'
import { redeem } from '../squid/utils'

const useRedeem = (squidChefContract: Contract) => {
  const { account } = useWallet()

  const handleRedeem = useCallback(async () => {
    const txHash = await redeem(squidChefContract, account)
    console.log(txHash)
    return txHash
  }, [account, squidChefContract])

  return { onRedeem: handleRedeem }
}

export default useRedeem
