import React from 'react'
import styled from 'styled-components'

interface LabelProps {
  text?: string,
  color?: any,
}

const Label: React.FC<LabelProps> = ({ text, color }) => (
  <StyledLabel color={color}>{text}</StyledLabel>
)

const StyledLabel = styled.div`
  color: ${(props) => props.color?props.color:props.theme.color.purple[400]};
`

export default Label
