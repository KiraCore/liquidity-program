import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import kira from '../../assets/img/kira.png'
import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import Stats from './components/Stats'
import Chart from './components/Chart'
import useAuctionData from '../../hooks/useAuctionData'


const Home: React.FC = () => {
  const [auctionFinished, setAuctionFinished] = useState<boolean>(false);
  const auctionData = useAuctionData()

  useEffect(() => {
    if (auctionData) {
      if (auctionData.auctionFinished) {
        setAuctionFinished(true);
      }
    }
  }, [auctionData])

  return (
    <Page>
      <PageHeader
        icon={<img src={kira} height={100} />}
        title="Kira Liquidity Auction"
        subtitle="Take part in the Kira Liquidity Auction to buy KEX!"
      />
      <Container>
        <Stats auctionData={auctionData}/>
      </Container>
      {!auctionFinished && (
        <Container size="lg">
          <Chart auctionData={auctionData}/>
        </Container>
      )}
      {auctionData && auctionFinished && (
        <StyledContainer>
          <StyledText>
            Auction Finished
          </StyledText>
          <StyledSubText>
            Click "My Wallet" button and claim your KEX now!, or await automatic distribution within 48 hours.
          </StyledSubText>
        </StyledContainer>
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

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60%;
  height: 150px;
`

const StyledText = styled.h1`
  display: flex;
  justify-content: center;
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
