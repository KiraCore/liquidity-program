import React from 'react'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink
        target="_blank"
        href="https://stake-contract.kira.network"
      >
        Contract
      </StyledLink>
      <StyledLink target="_blank" href="https://tg.kira.network">
        Telegram
      </StyledLink>
      <StyledLink target="_blank" href="https://git.kira.network">
        Github
      </StyledLink>
      <StyledLink target="_blank" href="https://twitter.kira.network">
        Twitter
      </StyledLink>
      <StyledLink target="_blank" href="https://blog.kira.network">
        Medium
      </StyledLink>
    </StyledNav>
  )
}

const StyledNav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
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
