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
                {"Deposit ETH to the address displayed on the home page while the auction is live. You can send only 1 tx every 1 hour and maximum 5 ETH in each transaction. After auction ends, connect your MetaMask wallet and claim your KEX immediately or await automatic distribution within ~48h. At the end everyone gets the same price regardless when they deposit ETH. You should transfer your coins when you think MAX price per KEX is fair. Auction ends when the constantly decreasing Hard Cap is reached."}
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
