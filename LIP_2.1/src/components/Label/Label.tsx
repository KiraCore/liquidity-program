import React from 'react'
import styled from 'styled-components'

interface LabelProps {
  text?: string,
  color?: any,
  weight?: any,
  size?: any,
}

const Label: React.FC<LabelProps> = ({ text, color, weight, size }) => (
  <StyledLabel color={color} style={{fontWeight: weight, fontSize: size }}>{text}</StyledLabel>
)

const StyledLabel = styled.div`
  color: ${(props) => props.color?props.color:props.theme.color.purple[600]};
`

export default Label
