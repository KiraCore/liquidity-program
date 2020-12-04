import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { Contract } from 'web3-eth-contract'

import {
  getKiraStakingContract,
  getWethContract,
  getFarms,
  getTotalLPWethValue,
} from '../kira/utils'
import useKira from './useKira'

export interface AllInfo {
  tokenAmountInStaking?: BigNumber
  wethAmountStaking?: BigNumber
  tokenAmountInPool?: BigNumber
  wethAmountInPool?: BigNumber
  totalWethValue?: BigNumber
  totalLiquidity?: BigNumber
  tokenPriceInWeth?: BigNumber
  lpAmountInPool?: BigNumber
  poolWeight?: BigNumber
}

const useAllInfo = () => {
  const [info, setInfo] = useState([] as Array<AllInfo>)
  const kira = useKira()
  const farms = getFarms(kira)
  const kiraStakingContract = getKiraStakingContract(kira)
  const wethContact = getWethContract(kira)

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
  }, [kiraStakingContract, kira])

  useEffect(() => {
    if (kira) {
      fetchAllStakedValue()
    }
  }, [kira])

  return info
}

export default useAllInfo
