import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import Value from '../../../components/Value'
import useAllEarnings from '../../../hooks/useAllEarnings'
import useStakedBalance from '../../../hooks/useStakedBalance'
import useAllStakedValue from '../../../hooks/useAllStakedValue'
import useTotalLPSupply from '../../../hooks/useTotalLPSupply'
import useFarms from '../../../hooks/useFarms'
import useETHPriceInUSD from '../../../hooks/useETHPrice'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useKira from '../../../hooks/useKira'
import { getKiraAddress, getKiraStakingAddress, getKiraStakingContract, getRewardRate } from '../../../kira/utils'
import { getBalanceNumber } from '../../../utils/formatBalance'
import Kira_Img from '../../../assets/img/kira.png'


const PendingRewards: React.FC = () => {
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(0)
  const [scale, setScale] = useState(1)

  const allEarnings = useAllEarnings()
  let sumEarning = 0
  for (let earning of allEarnings) {
    sumEarning += new BigNumber(earning)
      .div(new BigNumber(10).pow(18))
      .toNumber()
  }

  const [farms] = useFarms()
  const allStakedValue = useAllStakedValue()

  if (allStakedValue && allStakedValue.length) {
    const sumWeth = farms.reduce(
      (c, { id }, i) => c + (allStakedValue[i].totalWethValue.toNumber() || 0),
      0,
    )
  }

  useEffect(() => {
    setStart(end)
    setEnd(sumEarning)
  }, [sumEarning])

  return (
    <span
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'right bottom',
        transition: 'transform 0.5s',
        display: 'inline-block',
      }}
    >
      <CountUp
        start={start}
        end={end}
        decimals={end < 0 ? 4 : end > 1e5 ? 0 : 3}
        duration={1}
        onStart={() => {
          setScale(1.25)
          setTimeout(() => setScale(1), 600)
        }}
        separator=","
      />
    </span>
  )
}

const Balances: React.FC = () => {
  const kira = useKira()
  const kexBalanceInContract = useTokenBalance(getKiraAddress(kira), getKiraStakingAddress(kira))
  // console.log("KEX - BALANCE: " , kexBalanceInContract);
  const kiraStakingContract = getKiraStakingContract(kira)
  const { account, ethereum }: { account: any; ethereum: any } = useWallet()
  const totalLPSupply = useTotalLPSupply(account)
  const [rewardPerSecond, setRewardPerSecond] = useState(new BigNumber(0))
  const stakedBalance = useStakedBalance(0)
  const [ROI, setROI] = useState(new BigNumber(0))
  const ethPriceInUSD = useETHPriceInUSD()

  useEffect(() => {
    async function fetchTotalSupply() {
      const reward = await getRewardRate(kiraStakingContract)
      setRewardPerSecond(reward)
    }
    if (kira) {
      fetchTotalSupply()
    }
  }, [kira, setRewardPerSecond])

  // This is to get ROI per month
  useEffect(() => {
    if (totalLPSupply.toNumber() > 0) {
      setROI(stakedBalance.dividedBy(totalLPSupply).multipliedBy(rewardPerSecond).multipliedBy(3600 * 24 * 30))
    }
  }, [stakedBalance, totalLPSupply, rewardPerSecond])

  return (
    <StyledWrapper>
      <Card>
        <CardContent>
          <StyledBalances>
            <StyledBalance>
              <img src={Kira_Img} alt="" style={{width: '60px', height: '60px'}}/>
              <Spacer />
              <div style={{ flex: 1 }}>
                <Label text="Your ROI per month" color='#e88f54'/>
                <Value
                  value={!!account ? getBalanceNumber(ROI) + " KEX": 'Locked'}
                />
              </div>
            </StyledBalance>
            <StyledBalance>
              <Spacer />
              <div style={{ flex: 1 }}>
                <Label text="Your ROI per month" color='#e88f54'/>
                <Value
                  value={!!account ? getBalanceNumber(ROI) + " KEX": 'Locked'}
                />
              </div>
            </StyledBalance>
          </StyledBalances>
        </CardContent>
        <Footnote>
          Rewards per second
          <FootnoteValue>{getBalanceNumber(rewardPerSecond)} KEX</FootnoteValue>
        </Footnote>
      </Card>
      <Spacer />

      <Card>
        {!!account ? (
          <CardContent>
            <Label text="Value of Locked Assets" color='#e88f54'/>
            <Value
              value={!!account ? getBalanceNumber(kexBalanceInContract) : 'Locked'}
            />
          </CardContent>
        ):(
          <CardContent>
            <Label text="Total Circulating LP Token" color='#e88f54'/>
            <Value
              value={!!account ? getBalanceNumber(totalLPSupply, 18) : 'Locked'}
            />
          </CardContent>
        )}
        <Footnote>
          Pending harvest
          <FootnoteValue>
            <PendingRewards /> KEX
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

const StyledBalances = styled.div`
  display: flex;
`

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
`

export default Balances
