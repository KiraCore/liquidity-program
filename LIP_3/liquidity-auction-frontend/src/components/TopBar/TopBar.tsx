import React from 'react'
import styled from 'styled-components'

import Container from '../Container'
import Logo from '../Logo'

import AccountButton from './components/AccountButton'
import Button from '../Button'
import useModal from '../../hooks/useModal'
import AboutKiraAuction from '../AboutModal'

interface TopBarProps {
  onPresentMobileMenu: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onPresentMobileMenu }) => {
  const [onAboutModal] = useModal(<AboutKiraAuction />)
  return (
    <StyledTopBar>
      <Container size="lg">
        <StyledTopBarInner>
          <StyledLogoWrapper>
            <Logo />
          </StyledLogoWrapper>
          <StyledButtonWrapper>
            <StyledAccountButtonWrapper>
              <AccountButton />
            </StyledAccountButtonWrapper>
            <StyledAboutButtonWrapper>
              <Button onClick={onAboutModal} size="sm" text="About KLA" />
            </StyledAboutButtonWrapper>
          </StyledButtonWrapper>
        </StyledTopBarInner>
      </Container>
    </StyledTopBar>
  )
}

const StyledLogoWrapper = styled.div`
  width: 300px;
  @media (max-width: 400px) {
    width: auto;
  }
`

const StyledTopBar = styled.div``

const StyledTopBarInner = styled.div`
  align-items: center;
  display: flex;
  height: ${(props) => props.theme.topBarSize}px;
  justify-content: space-between;
  max-width: ${(props) => props.theme.siteWidth}px;
  width: 100%;
`

const StyledButtonWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;

  @media (max-width: 400px) {
    justify-content: center;
    width: auto;
  }
`

const StyledAccountButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 156px;
  margin: 10px;
  @media (max-width: 400px) {
    justify-content: center;
    width: auto;
  }
`

const StyledAboutButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 110px;
  margin: 10px;
  @media (max-width: 400px) {
    justify-content: center;
    width: auto;
  }
`

export default TopBar
