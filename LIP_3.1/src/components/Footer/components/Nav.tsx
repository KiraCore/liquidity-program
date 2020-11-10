import React from 'react'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink
        target="_blank"
        href="https://kovan.etherscan.io/address/0xa9C21f3201741b4d31C9b7934c21f671aA0Fd0B5#contracts"
      >
        KIRA Auction Contract
      </StyledLink>
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
