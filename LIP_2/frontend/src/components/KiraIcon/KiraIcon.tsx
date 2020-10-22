import React from 'react'
import kira from '../../assets/kira.png';

interface KiraIconProps {
  size?: number
  v1?: boolean
  v2?: boolean
  v3?: boolean
}

const KiraIcon: React.FC<KiraIconProps> = ({ size = 36, v1, v2, v3 }) => (
  <span
    role="img"
    style={{
      fontSize: size,
      filter: v1 ? 'saturate(0.5)' : undefined,
    }}
  >
    <img src={kira} height="50"/>
  </span>
)

export default KiraIcon
