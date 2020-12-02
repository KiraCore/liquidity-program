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
    </StyledTopBar>
  )
}

const StyledLogoWrapper = styled.div`
  width: 300px;
  @media (max-width: 400px) {
    width: auto;
  }
`

const StyledTopBar = styled.div`
  margin-top: 20px;
  width: 100%;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 ${props => props.theme.spacing[4]}px;
`

const StyledTopBarInner = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  height: ${(props) => props.theme.topBarSize}px;
  justify-content: space-between;
  max-width: ${(props) => props.theme.siteWidth}px;
  width: 100%;
`

const StyledButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 400px) {
    justify-content: flex-end;
    align-items: space-between;
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
