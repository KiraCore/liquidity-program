import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { provider } from 'web3-core'
import { useWallet } from 'use-wallet'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import Value from '../../../components/Value'
import useStakedLPBalance from '../../../hooks/useStakedLPBalance'
import useTotalLPInStakingContract from '../../../hooks/useTotalLPInStakingContract'
import useETHPrice from '../../../hooks/useETHPrice'
import useAllInfo from '../../../hooks/useAllInfo'
import useKira from '../../../hooks/useKira'
import { getKiraStakingContract, getRewardRate } from '../../../kira/utils'
import { getBalanceNumber } from '../../../utils/formatBalance'

const Balances: React.FC = () => {
  const kira = useKira()
  const kiraStakingContract = getKiraStakingContract(kira)
  const { account }: { account: string; ethereum: provider } = useWallet()

  const [rewardPerSecond, setRewardPerSecond] = useState(new BigNumber(0))
  const [ROI, setROI] = useState(new BigNumber(0))
  const [APY, setAPY] = useState(new BigNumber(0))
  const [kexPrice, setKexPrice] = useState(new BigNumber(0))
  const [lockedUserBalance, setLockedUserBalance] = useState(new BigNumber(0))
  const [valueOfLockedAssets, setValueOfLockedAssets] = useState(new BigNumber(0))
  const [totalLiquidityValue, setTotalLiquidityValue] = useState(new BigNumber(0))
  const [totalCirculatingLP, setTotalCirculatingLP] = useState(new BigNumber(0))
  
  const totalLPInStakingContract = useTotalLPInStakingContract()   // TOTAL LP TOKEN AMOUNT LOCKED IN STAKING CONTRACT
  const stakedLPBalance = useStakedLPBalance()          // USER'S LP TOKEN AMOUNT LOCED IN STAKING CONTRACT
  const ethPrice = useETHPrice()
  const allInfo = useAllInfo()

  useEffect(() => {
    async function fetchTotalSupply() {
      const reward = await getRewardRate(kiraStakingContract)
      console.log(`Rewards Rate: ${reward}`);
      setRewardPerSecond(reward.dividedBy(6)) // KEX has 6 decimals and rate is set in lowest denom
    }
    if (kira) {
      fetchTotalSupply()
    }
  }, [kira, setRewardPerSecond])

  useEffect(() => {
    if (allInfo[0] && rewardPerSecond) {
      const SECOND_PER_YEAR = 3600 * 24 * 365.25;
      const kexPriceInWeth = allInfo[0] ? allInfo[0].tokenPriceInWeth : new BigNumber(0);
      const totalWethValue = allInfo[0] ? allInfo[0].totalWethValue : new BigNumber(0);
      console.log(`  KEX Value in WETH: ${kexPriceInWeth}`);
      console.log(`Total Value in WETH: ${totalWethValue}`);
      setAPY(allInfo[0] ? kexPriceInWeth.times(rewardPerSecond).times(SECOND_PER_YEAR).div(totalWethValue) : new BigNumber(0))
    }
  }, [allInfo, rewardPerSecond])

  // GET ROI PER MONTH
  useEffect(() => {
    console.log(`   Total LP Tokens: ${totalLPInStakingContract}`);
    console.log(` Staked LP Balance: ${stakedLPBalance}`);
    console.log(`Rewards Per Second: ${rewardPerSecond}`);
    if (totalLPInStakingContract.toNumber() > 0) {
      const SECOND_PER_MONTH = ((3600 * 24 * 365.25) / 12);
      setROI((stakedLPBalance.dividedBy(totalLPInStakingContract)).multipliedBy(rewardPerSecond).multipliedBy(SECOND_PER_MONTH))
    }
  }, [stakedLPBalance, totalLPInStakingContract, rewardPerSecond])

  useEffect(() => {
    if (kira && allInfo[0]) {
      let percentOfUserBalance = totalLPInStakingContract && stakedLPBalance ? stakedLPBalance.dividedBy(totalLPInStakingContract) : 0;
      console.log("Total WETH Value: ", allInfo[0] && allInfo[0].totalWethValue)
      console.log("       ETH Price: ", ethPrice)
      let lockedWethValue = allInfo[0] && allInfo[0].totalWethValue.multipliedBy(percentOfUserBalance)
      setLockedUserBalance(lockedWethValue.multipliedBy(ethPrice))
      setValueOfLockedAssets(allInfo[0] && allInfo[0].totalWethValue.multipliedBy(ethPrice))
      setTotalLiquidityValue(allInfo[0] && allInfo[0].totalLiquidity.multipliedBy(ethPrice))
      setTotalCirculatingLP(allInfo[0] && allInfo[0].lpAmountInPool)
      setKexPrice(allInfo[0] && allInfo[0].tokenPriceInWeth.multipliedBy(ethPrice))
    }
  }, [kira, allInfo, stakedLPBalance, totalLPInStakingContract, ethPrice])

  return (
    <StyledWrapper>
      {!account ? ( // WALLET NOT CONNECTED
       <Card>
        <CardContent>
          <StyledCardContainer>
            <Label text="Reward Program" weight={600} size={20}/>
            <Spacer size="sm"/>

            <StyledInfoContainer>
              <Label text="- Total Value Locked" color='#333333'/>
              <StyledInfoValue>
                <Label text="$"/>
                <Value
                  value={valueOfLockedAssets.toNumber()}
                  decimals={0}
                />
              </StyledInfoValue>
            </StyledInfoContainer>

            <StyledInfoContainer>
              <Label text="- Annual Percentage Yield" color='#333333'/>
              <StyledInfoValue>
                <Value
                  value={getBalanceNumber(APY)}
                  decimals={0}
                />
                <Label text=" %"/>
              </StyledInfoValue>
            </StyledInfoContainer>
          </StyledCardContainer>
        </CardContent>
        <Footnote>
          Total Locked LP Tokens
          <FootnoteValue>
            {getBalanceNumber(totalLPInStakingContract, 18)} LP
          </FootnoteValue>
        </Footnote>
      </Card>
      ) : (   // WALLET CONNECTED
        <Card>
          <CardContent>
            <StyledCardContainer>
              <Label text="User Information" weight={600} size={20}/>
              <Spacer size="sm"/>
              <StyledInfoContainer>
                <Label text="- Your Value Locked" color='#333333'/>
                <StyledInfoValue>
                  <Label text="$"/>
                  <Value
                    value={lockedUserBalance.toNumber()}
                    decimals={0}
                  />
                </StyledInfoValue>
              </StyledInfoContainer>

              <StyledInfoContainer>
                <Label text="- Your Monthly Reward" color='#333333'/>
                <StyledInfoValue>
                  <Value
                    value={getBalanceNumber(ROI)}
                  />
                  <Label text="KEX"/>
                </StyledInfoValue>
              </StyledInfoContainer>
            </StyledCardContainer>
          </CardContent>
          <Footnote>
            Your Locked LP Tokens
            <FootnoteValue>
              {getBalanceNumber(stakedLPBalance, 18)} LP
            </FootnoteValue>
          </Footnote>
        </Card>
      )}

      <Spacer />

      {!account ? ( // WALLET NOT CONNECTED
        <Card>
          <CardContent>
            <StyledCardContainer>
              <Label text="Pool Information" weight={600} size={20}/>
              <Spacer size="sm"/>

              <StyledInfoContainer>
                <Label text="- Total Liquidity" color='#333333'/>
                <StyledInfoValue>
                  <Label text="$"/>
                  <Value
                    value={totalLiquidityValue.toNumber()}
                  />
                </StyledInfoValue>
              </StyledInfoContainer>

              <StyledInfoContainer>
                <Label text="- KEX Token Price" color='#333333'/>
                <StyledInfoValue>
                  <Label text="$ "/>
                  <Value
                    value={kexPrice.toNumber()}
                    decimals={4}
                  />
                </StyledInfoValue>
              </StyledInfoContainer>
            </StyledCardContainer>
          </CardContent>
          <Footnote>
            Total Circulating LP Tokens
            <FootnoteValue>
              {getBalanceNumber(totalCirculatingLP, 18)} LP
            </FootnoteValue>
          </Footnote>
        </Card>
      ) : (  // WALLET CONNECTED
        <Card>
          <CardContent>
            <StyledCardContainer>
              <Label text="Reward Program" weight={600} size={20}/>
              <Spacer size="sm"/>

              <StyledInfoContainer>
                <Label text="- Total Value Locked" color='#333333'/>
                <StyledInfoValue>
                  <Label text="$"/>
                  <Value
                    value={valueOfLockedAssets.toNumber()}
                    decimals={0}
                  />
                </StyledInfoValue>
              </StyledInfoContainer>

              <StyledInfoContainer>
                <Label text="- Annual Percentage Yield" color='#333333'/>
                <StyledInfoValue>
                  <Value
                    value={getBalanceNumber(APY)}
                    decimals={0}
                  />
                  <Label text=" %"/>
                </StyledInfoValue>
              </StyledInfoContainer>
            </StyledCardContainer>
          </CardContent>
          <Footnote>
            Total Locked LP Tokens
            <FootnoteValue>
              {getBalanceNumber(totalLPInStakingContract, 18)} LP
            </FootnoteValue>
          </Footnote>
        </Card>
      )}
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
