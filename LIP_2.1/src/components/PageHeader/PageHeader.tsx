import React from 'react'
import styled from 'styled-components'

import Container from '../Container'
import config from '../../config'

interface PageHeaderProps {
  icon: React.ReactNode
  subtitle?: string
  title?: string
  hasLP?: boolean
}

const PageHeader: React.FC<PageHeaderProps> = ({ icon, subtitle, title, hasLP = true }) => {
  return (
    <Container size="lg">
      <StyledPageHeader>
        <StyledIcon>{icon}</StyledIcon>
        <StyledTitle>Kira Liquidity Program</StyledTitle>
        {hasLP ? (
          <StyledSubtitle>{subtitle}</StyledSubtitle>
        ) : (
          <StyledWarning>{subtitle}</StyledWarning>
        )}
        {!hasLP && (<StyledLink href={config.UNISWAP_POOL_LINK} target="_blank">To Uniswap Pool</StyledLink>)}
      </StyledPageHeader>
    </Container>
  )
}

const StyledLink=styled.a`
  margin-top: 10px;
  color: ${(props) => props.theme.color.red[500]};
`
const StyledPageHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding-bottom: ${(props) => props.theme.spacing[6]}px;
  padding-top: ${(props) => props.theme.spacing[6]}px;
  margin: 0 auto;
`

const StyledIcon = styled.div`
  font-size: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
  width: 120px;
`

const StyledTitle = styled.h1`
  color: ${(props) => props.theme.color.purple[500]};
  font-size: 42px;
  text-align: center;
  font-weight: 600;
  margin: 10px;
  padding: 0;
`

const StyledSubtitle = styled.h3`
  color: ${(props) => props.theme.color.purple[400]};
  font-size: 18px;
  font-weight: 300;
  margin: 0;
  padding: 0;
  text-align: center;
`

const StyledWarning = styled.h3`
  color: ${(props) => props.theme.color.red[600]};
  font-size: 18px;
  font-weight: 300;
  margin: 0;
  padding: 0;
  text-align: center;
`

export default PageHeader
