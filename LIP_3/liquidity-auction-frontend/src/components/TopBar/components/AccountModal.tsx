import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import useKira from '../../../hooks/useKira'
import BigNumber from 'bignumber.js'
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
import { provider } from 'web3-core'
import { getKiraAuctionContract } from '../../../kira/utils'

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const {
    ethereum, account, reset
  }: { account: string, ethereum: provider, reset: any } = useWallet()

  const handleSignOutClick = useCallback(() => {
    onDismiss!()
    reset()
  }, [onDismiss, reset])

  const kira = useKira()
  const auctionContract = getKiraAuctionContract(kira);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    auctionContract.events.ClaimedTokens({}, (error: object, event:string) => {
      console.log(error, event);
    }).on('data', (event: string, returnValues: any) => {
      console.log("data : ", event);
      if (returnValues) {
        setBalance(new BigNumber(returnValues.amount).dividedBy(new BigNumber(10).pow(6)).toNumber())
      }
    });
  }, [auctionContract]);

  const claimMyKex = useCallback(async () => {
    try {
      await auctionContract.methods.claimTokens().send({from: account})
    } catch (e) {
      console.error(e)
      return false;
    }
  }, [ethereum, auctionContract])

  const onClaim = () => {
    if (ethereum && auctionContract) {
      claimMyKex();
    }
  }

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
              <CountUpValue value={balance} />
              <Label text="KEX Balance" />
            </StyledBalance>
          </StyledBalanceWrapper>
        </div>
        <Spacer />
        <Button 
          onClick={onClaim} 
          text="Claim my KEX" 
          size="sm" 
          variant="secondary"
        />
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
