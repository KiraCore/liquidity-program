import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Squid } from '../../squid'

export interface SquidContext {
  squid?: typeof Squid
}

export const Context = createContext<SquidContext>({
  squid: undefined,
})

declare global {
  interface Window {
    squidsauce: any
  }
}

const KiraProvider: React.FC = ({ children }) => {
  const { ethereum }: { ethereum: any } = useWallet()
  const [squid, setSquid] = useState<any>()

  // @ts-ignore
  window.squid = squid
  // @ts-ignore


  useEffect(() => {
    if (ethereum) {
      const chainId = Number(ethereum.chainId)
      const squidLib = new Squid(ethereum, chainId, false, {
        defaultAccount: ethereum.selectedAddress,
        defaultConfirmations: 1,
        autoGasMultiplier: 1.5,
        testing: false,
        defaultGas: '6000000',
        defaultGasPrice: '1000000000000',
        accounts: [],
        ethereumNodeTimeout: 10000,
      })
      setSquid(squidLib)
      window.squidsauce = squidLib
    }
  }, [ethereum])

  return <Context.Provider value={{ squid }}>{children}</Context.Provider>
}

export default KiraProvider
