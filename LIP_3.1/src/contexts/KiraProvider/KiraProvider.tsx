import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Kira } from '../../kira'

export interface KiraContext {
  kira?: typeof Kira
}

export const Context = createContext<KiraContext>({
  kira: undefined,
})

const KiraProvider: React.FC = ({ children }) => {
  const { ethereum }: { ethereum: any } = useWallet()
  const [kira, setKira] = useState<any>()

  // @ts-ignore
  window.kira = kira
  // @ts-ignore

  useEffect(() => {
    if (ethereum) {
      const chainId = Number(ethereum.chainId)
      const kiraLib = new Kira(ethereum, chainId, false, {
        defaultAccount: ethereum.selectedAddress,
        defaultConfirmations: 1,
        autoGasMultiplier: 1.5,
        testing: false,
        defaultGas: '6000000',
        defaultGasPrice: '1000000000000',
        accounts: [],
        ethereumNodeTimeout: 10000,
      })
      setKira(kiraLib)
    }
  }, [ethereum])

  return <Context.Provider value={{ kira }}>{children}</Context.Provider>
}

export default KiraProvider
