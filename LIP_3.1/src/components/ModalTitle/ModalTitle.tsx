import React from 'react'
import styled from 'styled-components'

interface ModalTitleProps {
  text?: string
}

const ModalTitle: React.FC<ModalTitleProps> = ({ text }) => (
  <StyledModalTitle>
    {text}
  </StyledModalTitle>
)

const StyledModalTitle = styled.div`
  align-items: center;
  color: ${props => props.theme.color.purple[600]};
  display: flex;
  font-size: 25px;
  font-weight: 600;
  height: ${props => props.theme.topBarSize}px;
  justify-content: center;
  margin-top: 20px;
`

export default ModalTitle