import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import kira from '../../assets/img/kira.png'

const Logo: React.FC = () => {
  return (
    <StyledLogo to="/">
      <img src={kira} height="32" style={{ marginTop: -4 }} />
      <StyledText>
        KIRA Staking
      </StyledText>
    </StyledLogo>
  )
}

const StyledLogo = styled(Link)`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: 0;
  min-height: 44px;
  min-width: 44px;
  padding: 0;
  text-decoration: none;
`

const StyledText = styled.span`
  color: ${(props) => props.theme.color.purple[800]};
  margin-left: ${(props) => props.theme.spacing[2]}px;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.03em;
  @media (max-width: 400px) {
    display: none;
  }
`

export default Logo
