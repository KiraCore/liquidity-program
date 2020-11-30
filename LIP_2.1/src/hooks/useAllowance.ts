import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import useKira from './useKira'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { Contract } from 'web3-eth-contract'

import { getAllowance } from '../utils/erc20'
import { getKiraStakingContract } from '../kira/utils'

const useAllowance = (lpContract: Contract) => {
  const [allowance, setAllowance] = useState(new BigNumber(0))
  const { account }: { account: string; ethereum: provider } = useWallet()
  const kira = useKira()
  const kiraStakingContract = getKiraStakingContract(kira)

  const fetchAllowance = useCallback(async () => {
    const allowance = await getAllowance(
      lpContract,
      account,
      kiraStakingContract.options.address,
    )
    setAllowance(new BigNumber(allowance))
  }, [account, kiraStakingContract, lpContract])

  useEffect(() => {
    if (account && kiraStakingContract && lpContract) {
      fetchAllowance()
    }
    let refreshInterval = setInterval(fetchAllowance, 10000)
    return () => clearInterval(refreshInterval)
  }, [account, kiraStakingContract, lpContract])

  return allowance
}

export default useAllowance
