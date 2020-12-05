import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { getKiraStakingContract, getTotalLPInStaking } from '../kira/utils'
import useKira from './useKira'
import useBlock from './useBlock'

const useTotalLPInStakingContract = () => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const kira = useKira()
  const kiraStakingContract = getKiraStakingContract(kira)
  const block = useBlock()

  const fetchBalance = useCallback(async () => {
    const balance = await getTotalLPInStaking(kiraStakingContract)
    setBalance(new BigNumber(balance))
  }, [ kiraStakingContract, kira])

  useEffect(() => {
    if (kiraStakingContract && kira) {
      fetchBalance()
    }
  }, [block, kiraStakingContract, setBalance, kira])

  return balance
}

export default useTotalLPInStakingContract
