import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useKira from '../../../hooks/useKira'
import { getKiraAddress } from '../../../kira/utils'
import { getBalanceNumber } from '../../../utils/formatBalance'
import Button from '../../Button'
import CardIcon from '../../CardIcon'
import Label from '../../Label'
import Modal, { ModalProps } from '../../Modal'
import ModalActions from '../../ModalActions'
import ModalContent from '../../ModalContent'
import ModalTitle from '../../ModalTitle'
import Spacer from '../../Spacer'
import { CountUpValue } from '../../Value/CountUpValue'
import kexIcon from '../../../assets/img/kira.png'

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const { account, reset } = useWallet()

  const handleSignOutClick = useCallback(() => {
    onDismiss!()
    reset()
  }, [onDismiss, reset])

  const kira = useKira()
  const kexBalance = useTokenBalance(getKiraAddress(kira))

  return (
    <Modal>
      <ModalTitle text="My Account" />
      <ModalContent>
        <Spacer />

        <div style={{ display: 'flex' }}>
          <StyledBalanceWrapper>
            <CardIcon>
              <img src={kexIcon} height="80"/>
            </CardIcon>
            <StyledBalance>
              <CountUpValue value={getBalanceNumber(kexBalance)} />
              <Label text="KEX Balance" />
            </StyledBalance>
          </StyledBalanceWrapper>
        </div>

        <Spacer />
        <Button
          href={`https://etherscan.io/address/${account}`}
          text="View on Etherscan"
          variant="secondary"
          size="sm"
        />
        <Spacer />
        <Button
          onClick={handleSignOutClick}
          text="Sign out"
          variant="secondary"
          size="sm"
        />
      </ModalContent>
      <ModalActions>
        <Button onClick={onDismiss} text="Cancel" size="sm"/>
      </ModalActions>
    </Modal>
  )
}

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
`

export default AccountModal
