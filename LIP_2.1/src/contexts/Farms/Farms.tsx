import React, { useCallback, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'
import useKira from '../../hooks/useKira'

import { getFarms } from '../../kira/utils'

import Context from './context'

const Farms: React.FC = ({ children }) => {
  const [unharvested, setUnharvested] = useState(0)

  const kira = useKira()
  const { account } = useWallet()

  const farms = getFarms(kira)

  return (
    <Context.Provider
      value={{
        farms,
        unharvested,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export default Farms
