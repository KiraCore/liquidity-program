import React, {useEffect, useMemo, useState} from 'react'
import styled from 'styled-components'
import {useWallet} from 'use-wallet'
import {provider} from 'web3-core'
import Spacer from '../../components/Spacer'
import useKira from '../../hooks/useKira'
import {getContract} from '../../utils/erc20'
import UnstakeXKira from './components/UnstakeXKira'
import StakeKira from "./components/StakeKira";

import {contractAddresses} from '../../kira/lib/constants'
import {getXKiraSupply} from "../../kira/utils";
import BigNumber from "bignumber.js";
import {getBalanceNumber} from "../../utils/formatBalance";

const StakeXKira: React.FC = () => {
  const {
    tokenAddress,
  } = {
    tokenAddress: contractAddresses.xKira[1],
  }

  const [totalSupply, setTotalSupply] = useState<BigNumber>()

  const kira = useKira()
  const {ethereum} = useWallet()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    async function fetchTotalSupply() {
      const supply = await getXKiraSupply(kira)
      setTotalSupply(supply)
    }
    if (kira) {
      fetchTotalSupply()
    }
  }, [kira, setTotalSupply])



  const lpContract = useMemo(() => {
    return getContract(ethereum as provider, tokenAddress)
  }, [ethereum, tokenAddress])

  return (
    <>
      <StyledFarm>
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <UnstakeXKira
              lpContract={lpContract}
            />
          </StyledCardWrapper>
          <Spacer/>
          <StyledCardWrapper>
            <StakeKira
            />
          </StyledCardWrapper>
        </StyledCardsWrapper>
        <Spacer size="lg"/>
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <StyledInfo>
              ℹ️️ You will earn a portion of the swaps fees based on the amount
              of xKira held relative the weight of the staking. xKira can be minted
              by staking KEX. To redeem KEX staked plus swap fees convert xKira
              back to KEX. {totalSupply ? `There are currently ${getBalanceNumber(totalSupply)} xKIRA in the whole pool.` : '' }
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

export default StakeXKira
