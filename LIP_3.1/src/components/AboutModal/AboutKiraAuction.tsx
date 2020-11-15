import React from 'react'
import styled from 'styled-components'

import Button from '../Button'
import Modal, { ModalProps } from '../Modal'
import ModalActions from '../ModalActions'
import ModalContent from '../ModalContent'
import ModalTitle from '../ModalTitle'

import Card from '../Card'
import CardContent from '../CardContent'
import CardTitle from '../CardTitle'

const AboutKiraAuction: React.FC<ModalProps> = ({ onDismiss }) => {
  return (
    <Modal>
      <ModalTitle text="About Kira Liquidity Auction" />
      <ModalContent>
        <StyledWalletsWrapper>
          <Card>
            <CardTitle text={"How Does This Work ?"} />
            <CardContent>
              <StyledText>
                {"Connect your MetaMask wallet and deposit ETH, that's all there is to it. Everyone gets the same price and the price depends on when the auction starts. To prevent auction from ending too fast and everyone having a chance to making it in time, the initial price is high and then rapidly descends. You can either send ETH right away or await until the KEX price reaches a lower level. However! if you wait too long you might not be able to make it. The auction ends instantly when the red bar indicating amount of ETH deposited by participants touches the green line indicting pice of KEX and the corresponding CAP."}
              </StyledText>
            </CardContent>
          </Card>
        </StyledWalletsWrapper>
      </ModalContent>
      <ModalActions>
        <Button text="Cool, Thanks" variant="secondary" onClick={onDismiss} size="md" />
      </ModalActions>
    </Modal>
  )
}

const StyledWalletsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    flex-direction: column;
    flex-wrap: none;
  }
`

const StyledText = styled.h3`
  color: ${(props) => props.theme.color.purple[500]};
  font-size: 15px;
  text-align: center;
  margin: 0;
  padding: 0;
`

export default AboutKiraAuction
