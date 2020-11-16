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
import cfgData from '../../../config.json';
import { exception } from 'react-ga'

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
  const [filledPercent, setFilledPercent] = useState<string>("0.00"); // % of the CAP remaining to be filled by the public

  const kira = useKira()
  const auctionConfig = useAuctionConfig()
  //const kexBalance = useTokenBalance()
  //const kexInitialSupply = useTokenInitialSupply()
  const resCnf: any = cfgData; // Config Data
  const kexAvailable = resCnf["available"] // max amount of KEX available for distribution
  const kexCirculating = resCnf["circulation"] // max circulating supply after auction end

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
    if (auctionData) {
      if (auctionData.ethDeposited <= 0) { // if raised nothing 
         setFilledPercent(new BigNumber(100).toNumber().toFixed(2)); // 0% was filled
      }

      if(auctionData.auctionEndCAP <= 0) {
          console.warn("Invalid data within auction data: ");
          console.warn(auctionData);
          throw new Error(`End CAP can't be less or equal 0, but was ${auctionData.kexPrice}`);
      }

      setFilledPercent((auctionData.ethDeposited/auctionData.auctionEndCAP).toFixed(2)) // what % of the current hard cap was deposited
    }
  }, [auctionData, currentKexPrice])

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
                  <Label text="Hard CAP Reached" color='#523632'/>
                  <StyledAuctionValue>{filledPercent}%</StyledAuctionValue>
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
                  <Label text="Projected CMC" color='#523632'/>
                  <StyledAuctionValue>${abbreviateNumber(new BigNumber(resCnf["circulation"]).multipliedBy(currentKexPrice).toNumber())}</StyledAuctionValue>
                </StyledAuctionTime>
              </div>
            </StyledBalance>
          </StyledBalances>
        </CardContent>

        <Footnote>
           Total KEX Allocated For Liquidity Auction
          <FootnoteValue>{resCnf["available"]} KEX</FootnoteValue>
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
