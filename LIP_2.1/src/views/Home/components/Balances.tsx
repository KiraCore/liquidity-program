import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import Value from '../../../components/Value'
import useStakedLPBalance from '../../../hooks/useStakedLPBalance'
import useTotalLPInStakingContract from '../../../hooks/useTotalLPInStakingContract'
import useTokenPrice from '../../../hooks/useTokenPrice'
import useAllInfo from '../../../hooks/useAllInfo'
import useKira from '../../../hooks/useKira'
import { getKiraStakingContract, getRewardRate } from '../../../kira/utils'
import { getBalanceNumber } from '../../../utils/formatBalance'

const Balances: React.FC = () => {
  const kira = useKira()
  const kiraStakingContract = getKiraStakingContract(kira)

  const [rewardPerSecond, setRewardPerSecond] = useState(new BigNumber(0))
  const [ROI, setROI] = useState(new BigNumber(0))
  const [APY, setAPY] = useState(new BigNumber(0))
  const [lockedUserBalance, setLockedUserBalance] = useState(new BigNumber(0))
  const [valueOfLockedAssets, setValueOfLockedAssets] = useState(new BigNumber(0))
  
  const totalLPInStakingContract = useTotalLPInStakingContract()   // TOTAL LP TOKEN AMOUNT LOCKED IN STAKING CONTRACT
  const stakedLPBalance = useStakedLPBalance()          // USER'S LP TOKEN AMOUNT LOCED IN STAKING CONTRACT
  const tokenPrice = useTokenPrice()
  const allInfo = useAllInfo()

  useEffect(() => {
    if (allInfo) {
      const SECOND_PER_YEAR = 3600 * 24 * 365
      const kexPriceInWeth = allInfo[0] ? allInfo[0].tokenPriceInWeth : new BigNumber(0);
      setAPY(allInfo[0] ? kexPriceInWeth.times(rewardPerSecond).times(SECOND_PER_YEAR).div(allInfo[0].totalWethValue) : new BigNumber(0))
    }
  }, [allInfo])

  useEffect(() => {
    async function fetchTotalSupply() {
      const reward = await getRewardRate(kiraStakingContract)
      setRewardPerSecond(reward)
    }
    if (kira) {
      fetchTotalSupply()
    }
  }, [kira, setRewardPerSecond])

  // GET ROI PER MONTH
  useEffect(() => {
    if (totalLPInStakingContract.toNumber() > 0) {
      const SECOND_PER_MONTH = 3600 * 24 * 30
      setROI(stakedLPBalance.dividedBy(totalLPInStakingContract).multipliedBy(rewardPerSecond).multipliedBy(SECOND_PER_MONTH))
    }
  }, [stakedLPBalance, totalLPInStakingContract, rewardPerSecond])

  useEffect(() => {
    if (stakedLPBalance && totalLPInStakingContract && allInfo[0]) {
      let percentOfUserBalance = totalLPInStakingContract ? stakedLPBalance.dividedBy(totalLPInStakingContract) : 0;
      let lockedWethValue = allInfo[0] && allInfo[0].totalWethValue.multipliedBy(percentOfUserBalance)
      setLockedUserBalance(lockedWethValue.multipliedBy(tokenPrice.ETH))
      setValueOfLockedAssets(allInfo[0] && allInfo[0].totalWethValue.multipliedBy(tokenPrice.ETH))
    }
  }, [stakedLPBalance, totalLPInStakingContract, allInfo])

  return (
    <StyledWrapper>
      <Card>
        <CardContent>
          <StyledCardContainer>
            <Label text="User Information" weight={600} size={20}/>
            <Spacer size="sm"/>

            <StyledInfoContainer>
              <Label text="- Your ROI per month" color='#333333'/>
              <StyledInfoValue>
                <Value
                  value={getBalanceNumber(ROI)}
                />
                <Label text="KEX"/>
              </StyledInfoValue>
            </StyledInfoContainer>

            <StyledInfoContainer>
              <Label text="- Value of your locked assets" color='#333333'/>
              <StyledInfoValue>
                <Label text="$"/>
                <Value
                  value={lockedUserBalance.toNumber()}
                />
              </StyledInfoValue>
            </StyledInfoContainer>
          </StyledCardContainer>
        </CardContent>
        <Footnote>
          Rewards per second
          <FootnoteValue>{getBalanceNumber(rewardPerSecond)} KEX</FootnoteValue>
        </Footnote>
      </Card>
      <Spacer />

      <Card>
        <CardContent>
          <StyledCardContainer>
            <Label text="Pool Information" weight={600} size={20}/>
            <Spacer size="sm"/>

            <StyledInfoContainer>
              <Label text="- Value of Total Locked Assets" color='#333333'/>
              <StyledInfoValue>
                <Label text="$"/>
                <Value
                  value={valueOfLockedAssets.toNumber()}
                />
              </StyledInfoValue>
            </StyledInfoContainer>

            <StyledInfoContainer>
              <Label text="- Annual Percentage Yield" color='#333333'/>
              <StyledInfoValue>
                <Value
                  value={getBalanceNumber(APY)}
                />
                <Label text=" %"/>
              </StyledInfoValue>
            </StyledInfoContainer>
          </StyledCardContainer>
        </CardContent>
        <Footnote>
          Total Circulating LP Token
          <FootnoteValue>
            {getBalanceNumber(totalLPInStakingContract, 18)} LP
          </FootnoteValue>
        </Footnote>
      </Card>
    </StyledWrapper>
  )
}

const Footnote = styled.div`
  font-size: 14px;
  padding: 8px 20px;
  color: ${(props) => props.theme.color.purple[400]};
  border-top: solid 1px ${(props) => props.theme.color.purple[300]};
`
const FootnoteValue = styled.div`
  font-family: 'Roboto Mono', monospace;
  float: right;
`

const StyledWrapper = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: stretch;
  }
`

const StyledCardContainer = styled.div`
  flex: 1
`

const StyledInfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const StyledInfoValue = styled.div`
  font-size: 20px;
  font-weight: 300;
  color: ${(props) => props.theme.color.purple[500]};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`
export default Balances
