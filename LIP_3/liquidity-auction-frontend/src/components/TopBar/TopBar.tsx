import React from 'react'
import styled from 'styled-components'

import Container from '../Container'
import Logo from '../Logo'

import AccountButton from './components/AccountButton'
import Button from '../Button'
import useModal from '../../hooks/useModal'
import Nav from './components/Nav'
import AboutModal from '../AboutModal'

interface TopBarProps {
  onPresentMobileMenu: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onPresentMobileMenu }) => {
  const [onAboutModal] = useModal(<AboutModal />)
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

const StyledNavWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  @media (max-width: 400px) {
    display: none;
  }
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


const StyledMenuButton = styled.button`
  background: none;
  border: 0;
  margin: 0;
  outline: 0;
  padding: 0;
  display: none;
  @media (max-width: 400px) {
    align-items: center;
    display: flex;
    height: 44px;
    justify-content: center;
    width: 44px;
  }
`

export default TopBar
