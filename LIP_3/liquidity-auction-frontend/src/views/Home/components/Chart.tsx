import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import KiraIcon from '../../../components/KiraIcon'
import useKira from '../../../hooks/useKira'
import Kira_Img from '../../../assets/img/kira.png'

const Chart: React.FC = () => {
 
  const kira = useKira()
  // const kexBalance = useTokenBalance(getKiraAddress(kira))
  const { account, ethereum }: { account: any; ethereum: any } = useWallet()
  
  // TODO: Get Auction Status
  const [auctionStartTime, setAuctionStartTime] = useState<string>("20:12:00:00");
  const [auctionEndTime, setAuctionEndTime] = useState<string>("29:11:00:00");
  const [auctionRemainingTime, setAuctionRemainingTime] = useState<number>(20);
  const [currentKexPrice, setCurrentKexPrice] = useState<number>(20);
  const [totalDeposited, setTotalDeposited] = useState<number>(50);
  const [totalKEXAmount, setTotalKexAmount] = useState<number>(10000);
  
  useEffect(() => {
    async function fetchTotalDeposited() {
    }
    if (kira) {
      fetchTotalDeposited()
    }
  }, [kira, setTotalDeposited])

  return (
    <StyledWrapper>
      
    </StyledWrapper>
  )
}

const Footnote = styled.div`
  font-size: 14px;
  padding: 8px 20px;
  color: ${(props) => props.theme.color.purple[400]};
  border-top: solid 1px ${(props) => props.theme.color.purple[300]};
`

const FootnoteValue = styled.div`
  font-family: 'Roboto Mono', monospace;
  float: right;
`

const StyledWrapper = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: stretch;
  }
`

export default Chart
