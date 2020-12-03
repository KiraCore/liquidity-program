import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'

import {
  getKiraStakingContract,
  getWethContract,
  getFarms,
  getTotalLPWethValue,
} from '../kira/utils'
import useKira from './useKira'
import useBlock from './useBlock'

export interface AllInfo {
  tokenAmountInStaking?: BigNumber
  wethAmountStaking?: BigNumber
  tokenAmountInPool?: BigNumber
  wethAmountInPool?: BigNumber
  totalWethValue?: BigNumber
  tokenPriceInWeth?: BigNumber
  poolWeight?: BigNumber
}

const useAllInfo = () => {
  const [info, setInfo] = useState([] as Array<AllInfo>)
  const { account }: { account: string; ethereum: provider } = useWallet()
  const kira = useKira()
  const farms = getFarms(kira)
  const kiraStakingContract = getKiraStakingContract(kira)
  const wethContact = getWethContract(kira)
  const block = useBlock()

  const fetchAllStakedValue = useCallback(async () => {
    const info: Array<AllInfo> = await Promise.all(
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
            kiraStakingContract,
            wethContact,
            lpContract,
            tokenContract,
            pid,
          ),
      ),
    )

    setInfo(info)
  }, [account, kiraStakingContract, kira])

  useEffect(() => {
    if (account && kiraStakingContract && kira) {
      fetchAllStakedValue()
    }
  }, [account, block, kiraStakingContract, setInfo, kira])

  return info
}

export default useAllInfo
