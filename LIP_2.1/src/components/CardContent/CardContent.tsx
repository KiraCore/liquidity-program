import React from 'react'
import styled from 'styled-components'


interface CardContentProps {
  children?: React.ReactNode,
  bgColor?: any,
}

const CardContent: React.FC<CardContentProps> = ({ children, bgColor }) => (
  <StyledCardContent style={{ backgroundColor: bgColor }}>{children}</StyledCardContent>
)

const StyledCardContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing[3]}px;
`

export default CardContent
