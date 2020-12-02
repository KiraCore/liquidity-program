import React from 'react'
import styled from 'styled-components'
import kira from '../../assets/img/kira.png'
import Button from '../../components/Button'
import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import Balances from './components/Balances'

const Home: React.FC = () => {
  return (
    <Page>
      <PageHeader
        icon={<img src={kira} height={90} />}
        title="Kira staking is Ready"
        subtitle="Stake Kira LP tokens to claim your very own KEX!"
      />

      <Container size="lg">
        <Balances />
      </Container>
      <Spacer size="lg" />
      <StyledInfo>
        💡<b>Pro Tip</b>: KEX-ETH UNI-V2 LP token pool yields TWICE more token rewards per second.
      </StyledInfo>
      <Spacer size="lg" />
      <div
        style={{
          margin: '0 auto',
        }}
      >
        <Button text="See available pools" to="/pools" variant="secondary" />
      </div>
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
