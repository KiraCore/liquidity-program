import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import kira from '../../assets/img/kira.png'
import Button from '../../components/Button'
import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import Balances from './components/Balances'
import useFarms from '../../hooks/useFarms'

const Home: React.FC = () => {
  const [farms] = useFarms()
  const [poolId, setPoolId] = useState('');

  useEffect(() => {
    if (farms && farms[0]) {
      setPoolId(farms[0].id)
    }
  }, [farms])

  return (
    <Page>
      <PageHeader
        icon={<img src={kira} height={90} />}
        title="Kira staking is Ready"
        subtitle="Lock your KEX-ETH UNI-V2 LP tokens to earn extra APY!"
      />

      <Container size="lg">
        <Balances />
      </Container>
      <Spacer size="lg" />
      <StyledInfo>
        💡<b>Pro Tip</b>: Make sure you connected Metamask and selected "Ethereum Mainnet" network!
      </StyledInfo>
      <Spacer size="lg" />
      <div
        style={{
          margin: '0 auto',
        }}
      >
        <Button text="Lock Tokens" to={`/pools/${poolId}`} variant="secondary" />
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
