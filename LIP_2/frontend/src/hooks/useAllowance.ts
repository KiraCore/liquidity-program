import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import useKira from './useKira'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { Contract } from 'web3-eth-contract'

import { getAllowance } from '../utils/erc20'
import { getKiraChefContract } from '../kira/utils'

const useAllowance = (lpContract: Contract) => {
  const [allowance, setAllowance] = useState(new BigNumber(0))
  const { account }: { account: string; ethereum: provider } = useWallet()
  const kira = useKira()
  const kiraChefContract = getKiraChefContract(kira)

  const fetchAllowance = useCallback(async () => {
    const allowance = await getAllowance(
      lpContract,
      account,
      kiraChefContract.options.address,
    )
    setAllowance(new BigNumber(allowance))
  }, [account, kiraChefContract, lpContract])

  useEffect(() => {
    if (account && kiraChefContract && lpContract) {
      fetchAllowance()
    }
    let refreshInterval = setInterval(fetchAllowance, 10000)
    return () => clearInterval(refreshInterval)
  }, [account, kiraChefContract, lpContract])

  return allowance
}

export default useAllowance
