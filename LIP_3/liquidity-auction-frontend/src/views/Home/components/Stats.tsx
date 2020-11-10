import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import styled from 'styled-components'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import useKira from '../../../hooks/useKira'
import useAuctionConfig from '../../../hooks/useAuctionConfig'
// import useAuctionData from '../../../hooks/useAuctionData'
import { AuctionData } from '../../../contexts/Auction'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useTokenInitialSupply from '../../../hooks/useTokenInitialSupply'
import { getKiraAddress } from '../../../kira/utils'
import Kira_Img from '../../../assets/img/kira.png'
import BigNumber from 'bignumber.js'

const RemainingTime: React.FC = () => {
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(0)
  const [scale, setScale] = useState(1)

  let sumEarning = 0

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

interface StatsProps {
  auctionData?: AuctionData
}

const abbreviateNumber = (value: number) => {
  let newValue:number = value;
  const suffixes = ["", "K", "M", "B","T"];
  let suffixNum = 0;
  while (newValue >= 1000) {
    newValue /= 1000;
    suffixNum++;
  }
  return newValue.toPrecision(3) + suffixes[suffixNum];
}

const Stats: React.FC<StatsProps> = ({ auctionData }) => {
  // TODO: Get Auction Status
  const [auctionStartTime, setAuctionStartTime] = useState<string>("");
  const [auctionEndTime, setAuctionEndTime] = useState<string>("");
  const [auctionRemainingTime, setAuctionRemainingTime] = useState<number>(0);
  const [currentKexPrice, setCurrentKexPrice] = useState<number>(0);
  const [totalDeposited, setTotalDeposited] = useState<number>(0);
  const [totalKEXAmount, setTotalKexAmount] = useState<number>(0);
  const [remainingPercent, setRemainingPercent] = useState<string>("");

  const kira = useKira()
  const auctionConfig = useAuctionConfig()
  const kexBalance = useTokenBalance(getKiraAddress(kira))
  const kexInitialSupply = useTokenInitialSupply(getKiraAddress(kira))

  useEffect(() => {
    if (auctionData) {
      setTotalDeposited(auctionData.ethDeposited)
      setCurrentKexPrice(+auctionData.kexPrice.toFixed(6))
      
      if (auctionData.auctionFinished) {
        setAuctionEndTime("Finished");
        setAuctionRemainingTime(0);
      } else {
        setAuctionRemainingTime(auctionData.auctionEndTimeLeft);

        let endTime = new Date(0);
        endTime.setUTCSeconds(auctionConfig.epochTime + auctionData.auctionEndTimeLeft);
        let day = endTime.getUTCDate();
        let hour = endTime.getUTCHours();
        let minute = endTime.getUTCMinutes();
        let second = endTime.getUTCSeconds();
        day = day ? day : 0;
        hour = hour ? hour : 0;
        minute = minute ? minute : 0;
        second = second ? second : 0;
        setAuctionEndTime([(day > 9 ? '' : '0') + day, (hour > 9 ? '' : '0') + hour, (minute > 9 ? '' : '0') + minute, (second > 9 ? '' : '0') + second].join(':'));
      }
    }
  }, [auctionData])

  useEffect(() => {
    if (auctionData && kexBalance) {
      let kexCalculated = auctionData.totalRaisedInUSD / (auctionData.kexPrice === 0 ? 1 : auctionData.kexPrice);
      let totalKex = kexBalance.toNumber() === 0 ? kexCalculated : Math.min(kexBalance.toNumber(), kexCalculated);
      setTotalKexAmount(+totalKex.toFixed(0));
      let remainingKex = new BigNumber(kexInitialSupply).minus(+totalKex.toFixed(0));
      setRemainingPercent(new BigNumber(remainingKex).dividedBy(kexInitialSupply).multipliedBy(100).toNumber().toFixed(3))
    }
  }, [auctionData, currentKexPrice, kexBalance])

  useEffect(() => {
    if (auctionConfig) {
      let startTime = new Date(0);
      startTime.setUTCSeconds(auctionConfig.epochTime);
      const day = startTime.getUTCDate();
      const hour = startTime.getUTCHours();
      const minute = startTime.getUTCMinutes();
      const second = startTime.getUTCSeconds();
      setAuctionStartTime([(day > 9 ? '' : '0') + day, (hour > 9 ? '' : '0') + hour, (minute > 9 ? '' : '0') + minute, (second > 9 ? '' : '0') + second].join(':'));
    }
  }, [auctionConfig])

  return (
    <StyledWrapper>
      <Card>
        <CardContent>
          <StyledBalances>
            <StyledBalance>
              <span
                role="img"
                style={{
                  fontSize: 50,
                }}
              >
                {"⏳"}
              </span>
              <Spacer />
              <div style={{ flex: 1 }}>
                <Label text="Liquidity Auction Status" color='#ab582b'/>
                <Spacer size="sm"/>

                <StyledAuctionTime>
                  <Label text="Starts at (UTC)" color='#523632'/>
                  <StyledAuctionValue>{auctionStartTime !== "" ? auctionStartTime : '00:00:00:00'}</StyledAuctionValue>
                </StyledAuctionTime>
               
                <StyledAuctionTime>
                  <Label text="Ends at at (UTC)" color='#523632'/>
                  <StyledAuctionValue>{auctionEndTime !== "" ? auctionEndTime : '00:00:00:00'}</StyledAuctionValue>
                </StyledAuctionTime>

                <StyledAuctionTime>
                  <Label text="Kex Remaining" color='#523632'/>
                  <StyledAuctionValue>{remainingPercent}%</StyledAuctionValue>
                </StyledAuctionTime>
              </div>
            </StyledBalance>
          </StyledBalances>
        </CardContent>

        <Footnote>
          Remaining Time
          <FootnoteValue>
            {auctionRemainingTime} Seconds
          </FootnoteValue>
        </Footnote>
      </Card>
      <Spacer />

      <Card>
        <CardContent>
          <StyledBalances>
            <StyledBalance>
              <img src={Kira_Img} alt="" style={{width: '60px', height: '60px'}}/>
              <Spacer />
              <div style={{ flex: 1 }}>
                <Label text="KEX Liquidity Market Status" color='#ab582b'/>
                <Spacer size="sm"/>

                <StyledAuctionTime>
                  <Label text="Projected KEX Price" color='#523632'/>
                  <StyledAuctionValue>{"$" + currentKexPrice}</StyledAuctionValue>
                </StyledAuctionTime>
               
                <StyledAuctionTime>
                  <Label text="ETH Deposited" color='#523632'/>
                  <StyledAuctionValue>{totalDeposited + " ETH"}</StyledAuctionValue>
                </StyledAuctionTime>

                <StyledAuctionTime>
                  <Label text="Current Cap" color='#523632'/>
                  <StyledAuctionValue>${abbreviateNumber(new BigNumber(12483333).multipliedBy(currentKexPrice).toNumber())}</StyledAuctionValue>
                </StyledAuctionTime>
              </div>
            </StyledBalance>
          </StyledBalances>
        </CardContent>

        <Footnote>
          KEX amount to be distributed
          <FootnoteValue>{totalKEXAmount} KEX</FootnoteValue>
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

const StyledAuctionTime = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const StyledAuctionValue = styled.div`
  color: ${(props) => props.theme.color.purple[600]};
  font-size: 20px;
  font-weight: 600;
`

export default Stats
