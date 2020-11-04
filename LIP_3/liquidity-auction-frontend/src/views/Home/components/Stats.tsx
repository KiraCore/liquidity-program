import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import useKira from '../../../hooks/useKira'
import { getTotalDeposited, getLatestPrice } from '../../../kira/utils'
import useAuctionConfig from '../../../hooks/useAuctionConfig'
import useTokenBalance from '../../../hooks/useTokenBalance'
import { getKiraAddress } from '../../../kira/utils'
import Kira_Img from '../../../assets/img/kira.png'

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

const Stats: React.FC = () => {
  // const kexBalance = useTokenBalance(getKiraAddress(kira))
  const { account, ethereum }: { account: any; ethereum: any } = useWallet()
  
  // TODO: Get Auction Status
  const [auctionStartTime, setAuctionStartTime] = useState<string>("00:00:00:00");
  const [auctionEndTime, setAuctionEndTime] = useState<string>("00:00:00:00");
  const [auctionRemainingTime, setAuctionRemainingTime] = useState<number>(0);
  const [currentKexPrice, setCurrentKexPrice] = useState<number>(20);
  const [totalDeposited, setTotalDeposited] = useState<number>(0);
  const [totalKEXAmount, setTotalKexAmount] = useState<number>(10000);
  
  const kira = useKira()
  const auctionConfig = useAuctionConfig()
  const kexBalance = useTokenBalance(getKiraAddress(kira))

  useEffect(() => {
    async function fetchTotalDeposited() {
      const totalEth = await getTotalDeposited(kira)
      setTotalDeposited(parseInt(totalEth))
    }

    async function fetchKEXPrice() {
      const ethPrice = await getLatestPrice(kira)
      setCurrentKexPrice(parseInt(ethPrice))
    }

    if (kira) {
      fetchTotalDeposited()
      fetchKEXPrice()
    }
  }, [kira])

  useEffect(() => {
    setTotalKexAmount(Math.min(kexBalance.toNumber(), totalDeposited / (currentKexPrice == 0 ? 1 : currentKexPrice)))
  }, [totalDeposited, currentKexPrice, kexBalance])

  useEffect(() => {
    if (auctionConfig) {
      const day = auctionConfig.startTime.getUTCDate();
      const hour = auctionConfig.startTime.getUTCHours();
      const minute = auctionConfig.startTime.getUTCMinutes();
      const second = auctionConfig.startTime.getUTCSeconds();
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
                  <StyledAuctionValue>{auctionStartTime !== "" ? auctionStartTime : 'Not started'}</StyledAuctionValue>
                </StyledAuctionTime>
               
                <StyledAuctionTime>
                  <Label text="Ends at at (UTC)" color='#523632'/>
                  <StyledAuctionValue>{auctionEndTime !== "" ? auctionEndTime : 'Not started'}</StyledAuctionValue>
                </StyledAuctionTime>
              </div>
            </StyledBalance>
          </StyledBalances>
        </CardContent>

        <Footnote>
          Remaining Time
          <FootnoteValue>
            <RemainingTime /> Seconds
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
                  <Label text="KEX Price" color='#523632'/>
                  <StyledAuctionValue>{"$" + currentKexPrice}</StyledAuctionValue>
                </StyledAuctionTime>
               
                <StyledAuctionTime>
                  <Label text="ETH Deposited" color='#523632'/>
                  <StyledAuctionValue>{totalDeposited + " ETH"}</StyledAuctionValue>
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
