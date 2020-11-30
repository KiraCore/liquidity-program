import React from 'react'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink
        target="_blank"
        href="https://etherscan.io/address/0x1D456A3C71e969987F4463Da63f527f04AD83297#code"
      >
        KIRA Staking Contract
      </StyledLink>
      {/*<StyledLink
        target="_blank"
        href="https://uniswap.info/pair/0xce84867c3c02b05dc570d0135103d3fb9cc19433"
      >
      </StyledLink> */}
      <StyledLink target="_blank" href="https://t.me/kirainterex">
        Telegram
      </StyledLink>
      <StyledLink target="_blank" href="https://github.com/KiraCore">
        Github
      </StyledLink>
      <StyledLink target="_blank" href="https://twitter.com/kira_core">
        Twitter
      </StyledLink>
      <StyledLink target="_blank" href="https://medium.com/kira-core">
        Medium
      </StyledLink>
    </StyledNav>
  )
}

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
`

const StyledLink = styled.a`
  color: ${(props) => props.theme.color.purple[400]};
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.color.purple[500]};
  }
`

export default Nav
