import React from 'react'
import styled from 'styled-components'
import kira from '../../assets/img/kira.png'
import Button from '../../components/Button'
import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import Stats from './components/Stats'
import Chart from './components/Chart'

const Home: React.FC = () => {
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
      <Container size="lg">
        <Chart />
      </Container>
      <Spacer size="lg" />
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

export default Home
