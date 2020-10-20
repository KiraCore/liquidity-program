import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'

import {
  getSquidChefContract,
  getWethContract,
  getFarms,
  getTotalLPWethValue,
} from '../squid/utils'
import useSquid from './useSquid'
import useBlock from './useBlock'

export interface StakedValue {
  tokenAmount: BigNumber
  wethAmount: BigNumber
  totalWethValue: BigNumber
  tokenPriceInWeth: BigNumber
  poolWeight: BigNumber
}

const useAllStakedValue = () => {
  const [balances, setBalance] = useState([] as Array<StakedValue>)
  const { account }: { account: string; ethereum: provider } = useWallet()
  const squid = useSquid()
  const farms = getFarms(squid)
  const squidChefContract = getSquidChefContract(squid)
  const wethContact = getWethContract(squid)
  const block = useBlock()

  const fetchAllStakedValue = useCallback(async () => {
    const balances: Array<StakedValue> = await Promise.all(
      farms.map(
        ({
          pid,
          lpContract,
          tokenContract,
        }: {
          pid: number
          lpContract: Contract
          tokenContract: Contract
        }) =>
          getTotalLPWethValue(
            squidChefContract,
            wethContact,
            lpContract,
            tokenContract,
            pid,
          ),
      ),
    )

    setBalance(balances)
  }, [account, squidChefContract, squid])

  useEffect(() => {
    if (account && squidChefContract && squid) {
      fetchAllStakedValue()
    }
  }, [account, block, squidChefContract, setBalance, squid])

  return balances
}

export default useAllStakedValue
