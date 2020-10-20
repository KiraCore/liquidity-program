import React, {useEffect, useMemo, useState} from 'react'
import styled from 'styled-components'
import {useWallet} from 'use-wallet'
import {provider} from 'web3-core'
import Spacer from '../../components/Spacer'
import useSquid from '../../hooks/useSquid'
import {getContract} from '../../utils/erc20'
import UnstakeXSquid from './components/UnstakeXSquid'
import StakeSquid from "./components/StakeSquid";

import {contractAddresses} from '../../squid/lib/constants'
import {getXSquidSupply} from "../../squid/utils";
import BigNumber from "bignumber.js";
import {getBalanceNumber} from "../../utils/formatBalance";

const StakeXSquid: React.FC = () => {
  const {
    tokenAddress,
  } = {
    tokenAddress: contractAddresses.xSquid[1],
  }

  const [totalSupply, setTotalSupply] = useState<BigNumber>()

  const squid = useSquid()
  const {ethereum} = useWallet()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    async function fetchTotalSupply() {
      const supply = await getXSquidSupply(squid)
      setTotalSupply(supply)
    }
    if (squid) {
      fetchTotalSupply()
    }
  }, [squid, setTotalSupply])



  const lpContract = useMemo(() => {
    return getContract(ethereum as provider, tokenAddress)
  }, [ethereum, tokenAddress])

  return (
    <>
      <StyledFarm>
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <UnstakeXSquid
              lpContract={lpContract}
            />
          </StyledCardWrapper>
          <Spacer/>
          <StyledCardWrapper>
            <StakeSquid
            />
          </StyledCardWrapper>
        </StyledCardsWrapper>
        <Spacer size="lg"/>
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <StyledInfo>
              ℹ️️ You will earn a portion of the swaps fees based on the amount
              of xSquid held relative the weight of the staking. xSquid can be minted
              by staking Squid. To redeem Squid staked plus swap fees convert xSquid
              back to Squid. {totalSupply ? `There are currently ${getBalanceNumber(totalSupply)} xSQUID in the whole pool.` : '' }
            </StyledInfo>
          </StyledCardWrapper>
        </StyledCardsWrapper>
        <Spacer size="lg"/>
      </StyledFarm>
    </>
  )
}

const StyledFarm = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`

const StyledCardsWrapper = styled.div`
  display: flex;
  width: 600px;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 80%;
  }
`

const StyledInfo = styled.h3`
  color: ${(props) => props.theme.color.purple[400]};
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;
`

export default StakeXSquid
