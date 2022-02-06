/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@chakra-ui/button';
import { FormControl } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { Flex, Text } from '@chakra-ui/layout';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/modal';
import { useState } from 'react';
import { KEX_FARM_CONTRACT_ADDR } from 'src/config';
import { useContracts } from 'src/hooks/useContracts';
import { FARM_RATE } from 'src/utils/constants';
import { ethers } from 'ethers';
import { OutlinedButton, PrimaryButton } from '../ui';
import { useToast } from '@chakra-ui/toast';
import { QueryDataTypes } from 'src/types/queryDataTypes';

type StakeKexModalProps = {
  isOpen?: boolean;
  onClose: () => any;
  onConfirm?: () => any;
  stake?: boolean;
  data: QueryDataTypes;
};

const StakeKexModal = ({ isOpen = false, onClose, stake = true, data }: StakeKexModalProps) => {
  const { token, stakingPool } = useContracts();
  const [value, setValue] = useState<number | undefined>(undefined);
  const [isLoading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const { kexBalance, krystalBalance, stakedBalance, allowance, updateInfo, loadAllowance } = data;

  const total = stake ? kexBalance : stakedBalance;
  const krystalsPerHour = value ? (value * 3600 * FARM_RATE) / Math.pow(10, 22) : 0;

  const onInputChange = (e: any) => {
    const v = parseFloat(e.target.value);
    setValue(isNaN(v) || v < 0 ? undefined : v);
  };

  const onUseAll = () => {
    setValue(stake ? kexBalance : stakedBalance);
  };

  let ready = false,
    enableApprove = false,
    enableConfirm = false,
    invalidInput = false;

  if (stake) {
    ready = kexBalance !== undefined && allowance !== undefined && !!value && value <= kexBalance;
    invalidInput = value !== undefined && kexBalance !== undefined && (value > kexBalance || value === 0);
    enableApprove = value !== undefined && allowance !== undefined && ready && value > allowance;
    enableConfirm = value !== undefined && allowance !== undefined && ready && value <= allowance;
  } else {
    ready = stakedBalance !== undefined && !!value && value <= stakedBalance;
    invalidInput = value !== undefined && stakedBalance !== undefined && (value > stakedBalance || value === 0);
    enableApprove = false;
    enableConfirm = ready;
  }

  const onConfirm = async () => {
    if (!value) return;

    setLoading(true);
    try {
      if (stake) {
        const txStake = await stakingPool.stake(ethers.utils.parseEther(value.toString()));
        toast({
          title: 'Pending Transaction',
          description: `Staking ${value} KEX`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        await txStake.wait();
        toast({
          title: 'Transaction Done',
          description: `Staked ${value} KEX`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        const txWithdraw = await stakingPool.withdraw(ethers.utils.parseEther(value.toString()));
        toast({
          title: 'Pending Transaction',
          description: `Unstaking ${value} KEX`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        await txWithdraw.wait();
        toast({
          title: 'Transaction Done',
          description: `Unstaked ${value} KEX`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      updateInfo();
      onClose();
    } catch (e: any) {
      toast({
        title: 'Transaction Failed',
        description: e.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error(e);
    }
    setLoading(false);
  };

  const onApprove = async () => {
    setLoading(true);
    try {
      const txApprove = await token.approve(KEX_FARM_CONTRACT_ADDR, ethers.constants.MaxUint256);
      toast({
        title: 'Pending Transaction',
        description: 'Approving KEX',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      await txApprove.wait();
      toast({
        title: 'Transaction Done',
        description: `Approved KEX`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      loadAllowance();
    } catch (e: any) {
      toast({
        title: 'Transaction Failed',
        description: e.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <Modal autoFocus blockScrollOnMount isOpen={isOpen} colorScheme="blue" onClose={onClose} isCentered motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent borderRadius={{ base: '8px', md: '20px' }}>
        <ModalHeader
          color="gray.secondary"
          px={{ base: '24px', md: '48px' }}
          pt={{ base: '36px', md: '48px' }}
          pb={{ base: '12px', md: '24px' }}
          fontSize="24px"
          lineHeight="33.6px"
        >
          {stake ? 'Stake KEX' : 'Unstake KEX'}
        </ModalHeader>
        <ModalBody px={{ base: '24px', md: '48px' }} py="0px">
          <Flex alignItems="center" direction="row" mb="12px">
            <Text mr="8px" fontSize="16px" lineHeight="26.24px" color="blue.dark">
              {stake ? 'Total KEX Available: ' : 'Total KEX Staked: '}
            </Text>
            {total === undefined && <Button isLoading variant="ghost" width="fit-content" color="blue.dark" height="16px" />}
            {total !== undefined && (
              <Text fontSize="16px" lineHeight="26.24px" color="blue.dark">
                {total.toLocaleString()}
              </Text>
            )}
          </Flex>

          <FormControl>
            <Flex
              bg="gray.septenary"
              height="46px"
              p="8px"
              direction="row"
              alignItems="center"
              borderRadius="8px"
              borderColor={invalidInput ? 'red.300' : 'none'}
              borderWidth="1px"
            >
              <Input
                variant="unstyled"
                size="md"
                color="gray.secondary"
                fontSize="16px"
                lineHeight="26.24px"
                type="number"
                min={0}
                value={value === undefined ? 'lol' : value} // funny dev, right?
                onChange={onInputChange}
                ml="16px"
              />
              <Text color="gray.quaternary" fontSize="16px" mr="32px" ml="8px">
                KEX
              </Text>
              <Button
                color="white"
                bg="gray.quaternary"
                borderRadius="4px"
                mr="8px"
                w="77px"
                h="30px"
                fontSize="12px"
                _hover={{ boxShadow: '0 0 8px rgb(41 142 255 / 80%)' }}
                onClick={onUseAll}
              >
                Use all
              </Button>
            </Flex>
          </FormControl>

          <Flex alignItems="center" direction="row" mt="10px">
            <Text fontSize="16px" lineHeight="26.24px" color="gray.secondary" mr="8px">
              {stake ? 'Krystals per hour:' : 'Krystals Received:'}
            </Text>
            {stake && <Text color="#298DFF">{(+krystalsPerHour.toFixed(3)).toLocaleString()}</Text>}
            {!stake &&
              (krystalBalance === undefined ? (
                <Button isLoading variant="ghost" width="fit-content" color="blue.dark" height="16px" />
              ) : (
                <Text color="#298DFF">{(+krystalBalance.toFixed(0)).toLocaleString()}</Text>
              ))}
          </Flex>
        </ModalBody>

        <ModalFooter px={{ base: '24px', md: '48px' }} pt={{ base: '16px', md: '32px' }} pb={{ base: '36px', md: '48px' }}>
          <Flex alignItems="center" justifyContent="space-around" direction="row" w="100%">
            <OutlinedButton
              text="CANCEL"
              onClick={onClose}
              rest={{
                width: '170px',
                height: '48px',
                color: 'gray.tertiary',
                borderWidth: '1px',
                _before: {
                  content: '""',
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  borderRadius: '6px',
                  padding: '1px',
                  background: 'linear-gradient(to right, #298DFF, #344AE6)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'destination-out',
                  maskComposite: 'exclude',
                },
              }}
            />
            {enableApprove && (
              <PrimaryButton
                text="APPROVE KEX"
                onClick={onApprove}
                rest={{ width: '170px', height: '48px', isLoading, disabled: isLoading, loadingText: 'APPROVING' }}
              />
            )}
            {!enableApprove && (
              <PrimaryButton
                text="CONFIRM"
                onClick={onConfirm}
                rest={{ width: '170px', height: '48px', disabled: !enableConfirm || isLoading, isLoading, loadingText: 'CONFIRM' }}
              />
            )}
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StakeKexModal;
