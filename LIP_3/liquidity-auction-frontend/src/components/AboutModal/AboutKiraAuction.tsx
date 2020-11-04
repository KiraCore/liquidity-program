import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'

import metamaskLogo from '../../assets/img/metamask-fox.svg'

import Button from '../Button'
import Modal, { ModalProps } from '../Modal'
import ModalActions from '../ModalActions'
import ModalContent from '../ModalContent'
import ModalTitle from '../ModalTitle'
import Spacer from '../Spacer'

import Card from '../Card'
import CardContent from '../CardContent'
import CardIcon from '../CardIcon'
import CardTitle from '../CardTitle'

const AboutKiraAuction: React.FC<ModalProps> = ({ onDismiss }) => {
  const { account, connect } = useWallet()

  useEffect(() => {
    if (account) {
      onDismiss()
    }
  }, [account, onDismiss])

  return (
    <Modal>
      <ModalTitle text="About Kira Liquidity Auction" />
      <ModalContent>
        <StyledWalletsWrapper>
          <Card>
            <CardTitle text={"Kira Auction"} />
            <CardContent>
              <StyledText>
                {"Kira liquidity auction Description"}
              </StyledText>
            </CardContent>
          </Card>
        </StyledWalletsWrapper>
      </ModalContent>
      <ModalActions>
        <Button text="Cancel" variant="secondary" onClick={onDismiss} size="md" />
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
