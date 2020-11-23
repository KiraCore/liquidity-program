import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import useAuctionConfig from '../../../hooks/useAuctionConfig'
import { AuctionData } from '../../../contexts/Auction'
import Kira_Img from '../../../assets/img/kira.png'
import BigNumber from 'bignumber.js'
import cfgData from '../../../config.json';
import useInterval from 'use-interval'

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
  const [auctionStartTime, setAuctionStartTime] = useState<string>("0d 0h 0m 0s");
  const [auctionEndTime, setAuctionEndTime] = useState<string>("0d 0h 0m 0s");
  const [currentTime, setCurrentTime] = useState<string>('');
  const [auctionEnded, setAuctionEnded] = useState<boolean>(false);
  const [currentKexPrice, setCurrentKexPrice] = useState<number>(0);
  const [projectedKexPrice, setProjectedKexPrice] = useState<number>(0);
  const [totalDeposited, setTotalDeposited] = useState<number>(0);
  const [filledPercent, setFilledPercent] = useState<string>("0.00"); // % of the CAP remaining to be filled by the public

  const auctionConfig = useAuctionConfig()
  const resCnf: any = cfgData; // Config Data
  
  const pad = (number: number) => {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }

  const getCurrentTime = (dt: Date) => {
    return dt.getUTCFullYear() +
    '-' + pad(dt.getUTCMonth() + 1) +
    '-' + pad(dt.getUTCDate()) +
    ' ' + pad(dt.getUTCHours()) +
    ':' + pad(dt.getUTCMinutes()) +
    ':' + pad(dt.getUTCSeconds());
  }

  const getRemainingTime = (epoch: number) => {
    const now = Date.now() / 1000;
    let diff = epoch - now;
    if (now >= epoch) diff = 0;
    const day = Math.floor(diff / (60 * 60 * 24));
    diff %= (60 * 60 * 24);
    const hour = Math.floor(diff / (60 * 60));
    diff %= (60 * 60);
    const minute = Math.floor(diff / 60);
    diff %= 60;
    const second = Math.floor(diff);
    return (pad(day) + 'd ') + 
          (pad(hour) + 'h ') + 
          (pad(minute) + 'm ') + 
          (pad(second) + 's');
  }

  const formatAmount = (x: number) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  useInterval(async () => {
    console.log("Interval running...");
    if (auctionConfig) {
      var timeNow = getCurrentTime(new Date());
      var timeEnd = getCurrentTime(new Date(auctionData.projectedEndTime*1000));
      setCurrentTime(auctionEnded ? timeEnd : timeNow);
      setAuctionStartTime(getRemainingTime(auctionConfig.epochTime));
      setAuctionEndTime(getRemainingTime(auctionData.projectedEndTime));
    }
  }, 1000);

  useEffect(() => {
    if (auctionData) {
      setTotalDeposited(+auctionData.ethDeposited.toFixed(3))
      setCurrentKexPrice(+auctionData.kexPrice.toFixed(6))
      setProjectedKexPrice(+auctionData.projectedKexPrice.toFixed(6))
      setAuctionEnded(auctionData.auctionFinished);
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

      let currentHardCap = auctionData.kexPrice * +resCnf['available'];
      let percent = currentHardCap <= 0 ? 0 : (auctionData.auctionStarted ? (auctionData.totalRaisedInUSD / currentHardCap) * 100 : 0);
      setFilledPercent((percent > 100 ? 100 : percent).toFixed(2)) // what % of the current hard cap was deposited
    }
  }, [auctionData, currentKexPrice, projectedKexPrice, auctionEnded])

  return (
    <StyledWrapper>
      <Card>
        <CardContent>
          <StyledBalances>
            <StyledBalance>
              <Spacer />
              <div style={{ flex: 1 }}>
                <Label text="Auction Status" weight={600} size={20}/>
                <Spacer size="sm"/>

                <StyledAuctionTime>
                  <Label text="- Auction Start" color='#333333'/>
                  <StyledAuctionValue>{auctionStartTime}</StyledAuctionValue>
                </StyledAuctionTime>
               
                <StyledAuctionTime>
                  <Label text="- Projected End" color='#333333'/>
                  <StyledAuctionValue>{auctionEndTime}</StyledAuctionValue>
                </StyledAuctionTime>

                <StyledAuctionTime>
                  <Label text="- Hard CAP Reached" color='#333333'/>
                  <StyledAuctionValue>{filledPercent}%</StyledAuctionValue>
                </StyledAuctionTime>
              </div>
            </StyledBalance>
          </StyledBalances>
        </CardContent>

        <Footnote>
          {auctionEnded ? "End Time UTC" : "Time Now UTC"}
          <FootnoteValue>
            {currentTime}
          </FootnoteValue>
        </Footnote>
      </Card>
      <Spacer />

      <Card>
        <CardContent>
          <StyledBalances>
            <StyledBalance>
              {/* <img src={Kira_Img} alt="" style={{width: '60px', height: '60px'}}/> */}
              <Spacer />
              <div style={{ flex: 1 }}>
                <Label text="Market Status" weight={600} size={20}/>
                <Spacer size="sm"/>

                <StyledAuctionTime>
                  <Label text={auctionEnded ? "- Final KEX Price" : "- Max KEX Price"} color='#333333'/>
                  <StyledAuctionValue>{currentKexPrice.toFixed(3) + " USD"}</StyledAuctionValue>
                </StyledAuctionTime>
               
                <StyledAuctionTime>
                  <Label text="- ETH Deposited" color='#333333'/>
                  <StyledAuctionValue>{totalDeposited + " ETH"}</StyledAuctionValue>
                </StyledAuctionTime>

                <StyledAuctionTime>
                  <Label text={auctionEnded ? "- Initial CMC" : "- Projected CMC"} color='#333333'/>
                  <StyledAuctionValue>{abbreviateNumber(new BigNumber(resCnf["circulation"]).multipliedBy(projectedKexPrice).toNumber()) + " USD"}</StyledAuctionValue>
                </StyledAuctionTime>
              </div>
            </StyledBalance>
          </StyledBalances>
        </CardContent>

        <Footnote>
           Total KEX Allocated For The Auction
          <FootnoteValue>{formatAmount(resCnf["available"])} KEX</FootnoteValue>
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
  justify-content: center;
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
  color: #000;
  font-size: 20px;
  font-weight: 300;
  color: ${(props) => props.theme.color.purple[500]};
`

export default Stats
