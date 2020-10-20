import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import useSquid from './useSquid'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { Contract } from 'web3-eth-contract'

import { getAllowance } from '../utils/erc20'
import { getSquidChefContract } from '../squid/utils'

const useAllowance = (lpContract: Contract) => {
  const [allowance, setAllowance] = useState(new BigNumber(0))
  const { account }: { account: string; ethereum: provider } = useWallet()
  const squid = useSquid()
  const squidChefContract = getSquidChefContract(squid)

  const fetchAllowance = useCallback(async () => {
    const allowance = await getAllowance(
      lpContract,
      account,
      squidChefContract.options.address,
    )
    setAllowance(new BigNumber(allowance))
  }, [account, squidChefContract, lpContract])

  useEffect(() => {
    if (account && squidChefContract && lpContract) {
      fetchAllowance()
    }
    let refreshInterval = setInterval(fetchAllowance, 10000)
    return () => clearInterval(refreshInterval)
  }, [account, squidChefContract, lpContract])

  return allowance
}

export default useAllowance
