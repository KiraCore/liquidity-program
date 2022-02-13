/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@chakra-ui/button';
import { FormControl } from '@chakra-ui/form-control';
import { Image } from '@chakra-ui/image';
import { Input } from '@chakra-ui/input';
import { Flex, Text } from '@chakra-ui/layout';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/modal';
import { useToast } from '@chakra-ui/toast';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { useContracts } from 'src/hooks/useContracts';
import { Card, NFT } from 'src/types/nftTypes';
import { QueryDataTypes } from 'src/types/queryDataTypes';
import { useWallet } from 'use-wallet';
import { OutlinedButton, PrimaryButton } from '../ui';

type NFTMintModalProps = {
  isOpen?: boolean;
  onClose: () => any;
  data: QueryDataTypes;
  nftId: number;
  loadCardInfo: () => any;
  nftInfo: NFT | undefined;
  cardInfo: Card | undefined;
};



const NFTMintModal = ({ isOpen = false, onClose, loadCardInfo, data, nftId, nftInfo, cardInfo }: NFTMintModalProps) => {
  const { krystalBalance } = data;
  const [value, setValue] = useState<number | undefined>(undefined);

  const { nft } = useContracts();
  const { account } = useWallet();
  const [card, setCard] = useState<Card | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  async function updateInfo(id: number) {
    const card = await nft.cards(id);

    // TODO: Debug only logs
    // console.log("NFTMintModal.txs => updateInfo:")
    // console.log({card: card})
    setCard(card);
  }

  useEffect(() => {
    if (account && isOpen) {
      setCard(undefined);
      updateInfo(nftId);
    }
  }, [isOpen, nftId]);

  const onInputChange = (e: any) => {
    const v = parseFloat(e.target.value);
    setValue(isNaN(v) || v < 0 ? undefined : v);
  };

  const price = Number.parseInt((cardInfo?.value ? cardInfo.value : BigNumber.from(0)).toString());
  const cost = price * ((value ? value : 0));
  const balance = (krystalBalance ? krystalBalance : 0);
  const nRemain: number | undefined = card === undefined ? undefined : card.quantity - card.sold;
  const invalidInput = value !== undefined && nRemain !== undefined && (balance <= 0 || value > nRemain || value === 0 || cost > balance);
  const disabledMint = !value || !nRemain || invalidInput;

  const onUseAll = () => {
    setValue((balance > 0 && price > 0) ? Math.floor(balance/price) : 0);
  };

  const onMint = async () => {
    if (value !== undefined && nRemain !== undefined && value <= nRemain && value > 0) {
      setLoading(true);
      try {
        //console.log("NFTMintModal.txs => onMint:");
        //console.log({nftId: nftId, value: value})
        const txStake = await nft.purchaseNFT(nftId, value);
        //console.log({txStake: txStake})
        toast({
          title: 'Pending Transaction',
          description: `Minting ${value} NFT${value > 1 ? 's' : ''} (Id: ${nftId})`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        console.log("Awaiting txStake...");
        await txStake.wait();
        toast({
          title: 'Transaction Done',
          description: `Minted ${value} NFT${value > 1 ? 's' : ''} (Id: ${nftId})`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        onClose();
        loadCardInfo();
      } catch (e: any) {
        toast({
          title: 'Transaction Failed',
          description: e.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        console.error("NFT Minting failed, see detailed error below:");
        console.error(e);
      }
      setLoading(false);
    }
  };

  return (
    <Modal autoFocus blockScrollOnMount isOpen={isOpen} colorScheme="blue" onClose={onClose} isCentered motionPreset="slideInBottom" size="lg">
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
          <Flex alignItems="center" direction="row">
            <Image src={cardInfo?.metadata?.image} width="72px" height="72px" borderRadius="16px" mr="24px" />
            <Flex direction="column">
              <Text color="gray.secondary">Confirm Minting</Text>
              <Text color="blue.dark">{`${card?.getName()} | ${card?.getRarity()} NFT`}</Text>
            </Flex>
          </Flex>
        </ModalHeader>
        <ModalBody px={{ base: '24px', md: '48px' }} py="0px">
          <Flex alignItems="center" direction="row" mb="4px">
            <Text mr="8px" fontSize="16px" lineHeight="26.24px" color="gray.quaternary">
              Price
            </Text>
            <Text fontSize="16px" lineHeight="26.24px" color="blue.dark">
              {price} krystals
            </Text>
          </Flex>
          <Flex alignItems="center" direction="row" mb="12px">
            <Text mr="8px" fontSize="16px" lineHeight="26.24px" color="gray.quaternary">
              Your Balance
            </Text>
            {krystalBalance === undefined && <Button isLoading variant="ghost" width="fit-content" />}
            {krystalBalance !== undefined && (
              <Text fontSize="16px" lineHeight="26.24px" color="blue.dark">
                {(+balance.toFixed(0)).toLocaleString()} krystals
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
                value={value === undefined ? '' : value}
                onChange={onInputChange}
                ml="16px"
              />
              <Text color="gray.quaternary" fontSize="16px" mr="32px" ml="8px">
                QUANTITY
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
                MAX
              </Button>
            </Flex>
          </FormControl>



          <Flex alignItems="center" direction="row" mt="10px">
            <Text fontSize="16px" lineHeight="26.24px" color="gray.secondary" mr="8px">
              Remaining NFTs:
            </Text>
            {nRemain === undefined && <Button isLoading variant="ghost" color="blue.dark" width="fit-content" height="16px" />}
            {nRemain !== undefined && (
              <Text fontSize="16px" lineHeight="26.24px" color="blue.dark">
                {nRemain}
              </Text>
            )}
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
            <PrimaryButton text="MINT" onClick={onMint} rest={{ width: '170px', height: '48px', isLoading: loading, disabled: disabledMint || loading }} />
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NFTMintModal;
