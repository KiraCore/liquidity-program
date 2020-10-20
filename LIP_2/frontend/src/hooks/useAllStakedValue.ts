import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'

import {
  getKiraChefContract,
  getWethContract,
  getFarms,
  getTotalLPWethValue,
} from '../kira/utils'
import useKira from './useKira'
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
  const kira = useKira()
  const farms = getFarms(kira)
  const kiraChefContract = getKiraChefContract(kira)
  const wethContact = getWethContract(kira)
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
            kiraChefContract,
            wethContact,
            lpContract,
            tokenContract,
            pid,
          ),
      ),
    )

    setBalance(balances)
  }, [account, kiraChefContract, kira])

  useEffect(() => {
    if (account && kiraChefContract && kira) {
      fetchAllStakedValue()
    }
  }, [account, block, kiraChefContract, setBalance, kira])

  return balances
}

export default useAllStakedValue
