import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import Value from '../../../components/Value'
import useStakedLPBalance from '../../../hooks/useStakedLPBalance'
import useTotalLPSupply from '../../../hooks/useTotalLPSupply'
import useTokenPrice from '../../../hooks/useTokenPrice'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useKira from '../../../hooks/useKira'
import { getKiraAddress, getKiraStakingAddress, getKiraStakingContract, getRewardRate } from '../../../kira/utils'
import { getBalanceNumber } from '../../../utils/formatBalance'
import config from '../../../config'

const Balances: React.FC = () => {
  const kira = useKira()
  const { account }: { account: any; ethereum: any } = useWallet()
  const [rewardPerSecond, setRewardPerSecond] = useState(new BigNumber(0))
  const [ROI, setROI] = useState(new BigNumber(0))
  const [lockedUserBalance, setLockedUserBalance] = useState(new BigNumber(0))

  const kexBalanceInContract = useTokenBalance(getKiraAddress(kira), account)
  const poolSizeInKEX = useTokenBalance(getKiraAddress(kira), getKiraStakingAddress(kira))
  const [valueOfLockedAssets, setValueOfLockedAssets] = useState(new BigNumber(0))

  const kiraStakingContract = getKiraStakingContract(kira)
  const totalLPSupply = useTotalLPSupply(account)   // TOTAL LP TOKEN AMOUNT LOCKED IN STAKING CONTRACT
  const stakedLPBalance = useStakedLPBalance()          // USER'S LP TOKEN AMOUNT LOCED IN STAKING CONTRACT
  const tokenPrice = useTokenPrice()

  useEffect(() => {
    setValueOfLockedAssets(kexBalanceInContract.multipliedBy(tokenPrice.KEX))
  }, [tokenPrice, kexBalanceInContract])

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
    if (totalLPSupply.toNumber() > 0) {
      setROI(stakedLPBalance.dividedBy(totalLPSupply).multipliedBy(rewardPerSecond).multipliedBy(3600 * 24 * 30))
    }
  }, [stakedLPBalance, totalLPSupply, rewardPerSecond])

  useEffect(() => {
    if (stakedLPBalance && totalLPSupply) {
      let percentOfUserBalance = stakedLPBalance.dividedBy(totalLPSupply)
      let lockedKEXBalance = kexBalanceInContract.multipliedBy(percentOfUserBalance)
      setLockedUserBalance(lockedKEXBalance.multipliedBy(tokenPrice.KEX))
    }
  }, [stakedLPBalance, totalLPSupply, kexBalanceInContract])

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
                  value={getBalanceNumber(lockedUserBalance)}
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
                  value={getBalanceNumber(valueOfLockedAssets)}
                />
              </StyledInfoValue>
            </StyledInfoContainer>

            <StyledInfoContainer>
              <Label text="- Annual Percentage Yield" color='#333333'/>
              <StyledInfoValue>
                <Value
                  value={0}
                />
                <Label text=" %"/>
              </StyledInfoValue>
            </StyledInfoContainer>
          </StyledCardContainer>
        </CardContent>
        <Footnote>
          Total Circulating LP Token
          <FootnoteValue>
            {getBalanceNumber(totalLPSupply, 18)} LP
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
