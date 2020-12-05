import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Kira } from '../../kira'
import { Account } from '../../kira/lib/accounts'
import { provider } from 'web3-core'

export interface KiraContext {
  kira?: typeof Kira
}

export const Context = createContext<KiraContext>({
  kira: undefined,
})

declare global {
  interface Window {
    kirasauce: any
  }
}

const KiraProvider: React.FC = ({ children }) => {
  const {
    account,
    ethereum,
  }: { account: string; ethereum: any } = useWallet()
  const [kira, setKira] = useState<any>()

  // @ts-ignore
  window.kira = kira
  // @ts-ignore

  useEffect(() => {
    const chainId = ethereum && Number(ethereum.chainId)
    const kiraLib = new Kira(ethereum, chainId, false, {
      defaultAccount: ethereum && ethereum.selectedAddress,
      defaultConfirmations: 1,
      autoGasMultiplier: 1.5,
      testing: false,
      defaultGas: '6000000',
      defaultGasPrice: '1000000000000',
      accounts: [],
      ethereumNodeTimeout: 10000,
    })
    setKira(kiraLib)
    window.kirasauce = kiraLib
  }, [ethereum, account])

  return <Context.Provider value={{ kira }}>{children}</Context.Provider>
}

export default KiraProvider
