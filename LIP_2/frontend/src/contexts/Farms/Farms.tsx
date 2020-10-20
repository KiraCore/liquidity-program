import React, { useCallback, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'
import useSquid from '../../hooks/useSquid'

import { bnToDec } from '../../utils'
import { getSquidChefContract, getEarned } from '../../squid/utils'
import { getFarms } from '../../squid/utils'

import Context from './context'
import { Farm } from './types'

const Farms: React.FC = ({ children }) => {
  const [unharvested, setUnharvested] = useState(0)

  const squid = useSquid()
  const { account } = useWallet()

  const farms = getFarms(squid)

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
