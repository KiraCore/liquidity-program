import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import kira from '../../assets/img/kira.png'
import Button from '../../components/Button'
import { useWallet } from 'use-wallet'
import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import Stats from './components/Stats'
import Chart from './components/Chart'
import useAuction from '../../hooks/useAuctionConfig'

const Home: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const { account } = useWallet()

  return (
    <Page>
      <PageHeader
        icon={<img src={kira} height={100} />}
        title="Kira Liquidity Auction Frontend"
        subtitle="Take part in kira liquidity auction to claim your own KEX!"
      />
      <Container>
        <Stats />
      </Container>
      <Spacer size="md" />
      {!!account ? (
        <Container size="lg">
          <Chart />
        </Container>
      ) : (
        <StyledContainer>
          <StyledText>
            Please connect to your wallet
          </StyledText>
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
  align-items: center;
  display: flex;
  width: 60%;
  height: 150px;
  justify-content: center;
`
// border-radius: 25px;
// border-width: 2px;
// border-color: ${props => props.theme.color.purple[800]};
// background-color: ${props => props.theme.color.purple[100]};

const StyledText = styled.h1`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100px;
  font-size: 18;
  color: ${props => props.theme.color.purple[500]};
`

export default Home
