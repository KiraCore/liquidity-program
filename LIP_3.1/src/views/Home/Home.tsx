import React, { useEffect, useState, useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import kira from '../../assets/img/kira.png'
import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import Stats from './components/Stats'
import Chart from './components/Chart'
import useAuctionData from '../../hooks/useAuctionData'
import { ChasingDots } from 'styled-spinkit'

const Home: React.FC = () => {
  const [auctionFinished, setAuctionFinished] = useState<boolean>(false);
  const [auctionStarted, setAuctionStarted] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const { color, spacing } = useContext(ThemeContext);
  const auctionData = useAuctionData();

  useEffect(() => {
    if (auctionData) {
      if (auctionData.auctionFinished) {
        setAuctionFinished(true);
      }
      if (auctionData.auctionStarted) {
        setAuctionStarted(true);
      }
      if (!auctionData.isLoading) {
        setLoading(false);
      }
    }
  }, [auctionData])

  return (
    <Page>
      <PageHeader
        icon={<img src={kira} height={100} />}
        title="Kira Liquidity Auction"
        subtitle={auctionFinished ? "Thank you all for participation in the event! " : auctionStarted ? "Buy and discover KEX price!" : "Event will begin shortly!" }
      />
        {!isLoading ? ( 
          <Container size="lg">
            <Stats auctionData={auctionData}/>
            <Chart auctionData={auctionData}/>
          </Container>
        ) : (
          <Container size="lg">
            <ChasingDots
              color={color.purple[600]}
              size={60}	
            />
            <StyledText>Loading...</StyledText>
          </Container>
        )}
      <Spacer size="md" />
      <StyledInfo>
        💡<b>Pro Tip</b>: Click "Connect Wallet" if you didn't yet : )
      </StyledInfo>
    </Page>
  )
}

const StyledInfo = styled.h3`
  color: ${(props) => props.theme.color.purple[500]};
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;

  > b {
    color: ${(props) => props.theme.color.purple[600]};
  }
`

const StyledText = styled.h1`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-size: 18;
  color: ${props => props.theme.color.purple[500]};
`

const StyledSubText = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  font-size: 15;
  overflow-wrap: break-word;
  margin-top: 20px;
  color: ${props => props.theme.color.purple[500]};
`

export default Home
