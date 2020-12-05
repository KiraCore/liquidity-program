import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import { getBalance } from '../utils/erc20'
import { getKiraAddress, getLPAddress } from '../kira/utils'
import useBlock from './useBlock'
import useKira from './useKira'

const useTokenBalance = (isKex: boolean) => {
  const [balance, setBalance] = useState(new BigNumber(-1))
  const {
    account,
    ethereum,
  }: { account: string; ethereum: provider } = useWallet()
  const block = useBlock()
  const kira = useKira()
  const [tokenAddress, setTokenAddress] = useState('')

  useEffect(() => {
    if (kira) {
      setTokenAddress(isKex ? getKiraAddress(kira) : getLPAddress(kira));
    }
  }, [kira])

  const fetchBalance = useCallback(async () => {
    const balance = await getBalance(ethereum, tokenAddress, account)
    setBalance(new BigNumber(balance))
  }, [account, ethereum, tokenAddress])

  useEffect(() => {
    if (account && ethereum) {
      fetchBalance()
    }
  }, [account, ethereum, setBalance, block, tokenAddress])

  return balance
}

export default useTokenBalance
