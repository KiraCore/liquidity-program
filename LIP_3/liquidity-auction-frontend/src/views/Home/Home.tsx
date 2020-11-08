import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import kira from '../../assets/img/kira.png'
import { useWallet } from 'use-wallet'
import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import Stats from './components/Stats'
import Chart from './components/Chart'
import Button from '../../components/Button'
import useAuctionData from '../../hooks/useAuctionData'


const Home: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [auctionFinished, setAuctionFinished] = useState<boolean>(false);

  const auctionData = useAuctionData()
  const { account } = useWallet()

  useEffect(() => {
    if (auctionData) {
      if (auctionData.auctionFinished) {
        setAuctionFinished(true);
      }
    }
  }, [auctionData])

  const onClaim = () => {
    console.log("claim")
  }

  return (
    <Page>
      <PageHeader
        icon={<img src={kira} height={100} />}
        title="Kira Liquidity Auction Frontend"
        subtitle="Take part in kira liquidity auction to claim your own KEX!"
      />
      <Container>
        <Stats auctionData={auctionData}/>
      </Container>
      <Spacer size="md" />

      {!!account && auctionData && !auctionFinished && (
        <Container size="lg">
          <Chart auctionData={auctionData}/>
        </Container>
      )}

      {(!account || !auctionData) && (
        <StyledContainer>
          <StyledText>
            Please connect to your wallet
          </StyledText>
        </StyledContainer>
      )}

      {!!account && auctionData && auctionFinished && (
        <StyledContainer>
          <StyledText>
            Auction Finished
          </StyledText>
          <StyledSubText>
            Please go to your wallet and claim your own KEX.
          </StyledSubText>
        </StyledContainer>
      )}

      <Spacer size="md" />
      <StyledInfo>
        💡<b>Pro Tip</b>: This auction is for distributing KEX amount to whom deposited ETH.
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
  margin-top: 20px;
  color: ${props => props.theme.color.purple[500]};
`

export default Home
