import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { getBalance } from '../utils/kira'
import cfgData from '../config.json';

const useTokenBalance = () => {
  const resCnf: any = cfgData; // Config Data
  const kexAddress = resCnf['token'];
  const [balance, setBalance] = useState(new BigNumber(0))
  const {
    account,
    ethereum,
  }: { account: string; ethereum: provider } = useWallet()

  const fetchBalance = useCallback(async () => {
    const balance = await getBalance(ethereum, kexAddress, account)
    setBalance(new BigNumber(balance))
  }, [account, ethereum, kexAddress])

  useEffect(() => {
    if (account && ethereum) {
      fetchBalance()
    }
  }, [account, ethereum, setBalance, kexAddress])

  return balance
}

export default useTokenBalance