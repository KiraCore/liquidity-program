/* eslint-disable react-hooks/exhaustive-deps */
import Web3 from 'web3';
import { useWallet } from 'use-wallet';
import { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { IMG_CRYSTAL, IMG_KEX } from 'src/assets/images';
import { Divider, Flex } from '@chakra-ui/layout';
import { TriangleDownIcon } from '@chakra-ui/icons';
import { shortenAddress } from 'src/utils/formatAddress';
import { Text, Image, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Button, IconButton } from '@chakra-ui/react';
import OutlinedButton from './OutlinedButton';
import { useModal } from 'src/hooks/useModal';
import { QueryDataTypes } from 'src/types/queryDataTypes';
import { Menu, MenuButton, MenuDivider, MenuItem, MenuList } from '@chakra-ui/menu';
import { SVG_HAMBURGER, SVG_USER } from 'src/assets/images';
import { HEADER_MENUS } from 'src/utils/constants';
import { StakeKexModal } from '../modals';
import { CollectionIcon } from '../icons';
import LogOutIcon from '../icons/LogOutIcon';

const ProfileNavButton = ({ data }: { data: QueryDataTypes }) => {
  const { account, connect, reset } = useWallet();

  const checkMetaMask = useCallback(async () => {
    const activate = (connector: any) => connect(connector);

    let web3;
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      web3 = new Web3(window.web3.currentProvider);
    } else {
      return;
    }
    const result = await web3.eth.getAccounts();
    if (result && result.length > 0) {
      await activate('injected');
    }
  }, []);

  useEffect(() => {
    checkMetaMask();
  }, [checkMetaMask]);

  const onConnectWallet = () => {
    connect('injected');
  };

  const onDisconnectWallet = () => {
    reset();
  };

  const { isOpenStakeModal, showStakeModal, isOpenUnstakeModal, showUnstakeModal } = useModal();

  const { kexBalance, stakedBalance, krystalBalance } = data;
  const { push } = useHistory();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const open = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const openMobile = () => setIsOpenMobile(!isOpenMobile);
  const closeMobile = () => setIsOpenMobile(false);

  const navigateTo = (path: string) => {
    push(path);
    close();
  };

  if (!account) {
    return (
      <>
        <OutlinedButton text="CONNECT WALLET" onClick={onConnectWallet} rest={{ display: { base: 'none', md: 'inherit' } }} />
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<Image src={SVG_HAMBURGER} />}
            colorScheme="blue.dark"
            display={{ base: 'inherit', md: 'none' }}
          />
          <MenuList bgColor="gray.700" display={{ base: 'inherit', md: 'none' }}>
            <MenuItem _hover={{ bg: 'whiteAlpha.100' }} _focus={{ bg: 'whiteAlpha.100' }} onClick={onConnectWallet}>
              CONNECT WALLET
            </MenuItem>
            <MenuDivider />
            {HEADER_MENUS.map(({ label }) => (
              <MenuItem key={label} _hover={{ bg: 'whiteAlpha.100' }}>
                {label}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </>
    );
  }

  const popoverContent = (isMobile: boolean = false) => (
    <PopoverContent
      color="gray.senary"
      bg="white"
      borderRadius="8px"
      border="none"
      cursor="initial"
      _focus={{ boxShadow: 'none' }}
      display={isMobile ? { base: 'inherit', md: 'none' } : { base: 'none', md: 'inherit' }}
    >
      <PopoverArrow />
      <PopoverBody px="24px" py="6px">
        <Flex direction="row" alignItems="center" pb="18px" pt="18px">
          <Flex direction="column" flex="1">
            <Text fontSize="12px" lineHeight="18px" fontWeight="400" color="gray.quaternary" mb="4px">
              Total KEX Owned
            </Text>
            {kexBalance === undefined && <Button isLoading variant="ghost" height="16px" width="fit-content" color="gray.secondary" />}
            {kexBalance !== undefined && (
              <Text fontSize="14px" lineHeight="15.82px" color="gray.secondary" fontWeight="600">
                {(+kexBalance.toFixed(0)).toLocaleString()}
              </Text>
            )}
          </Flex>
          <OutlinedButton
            text="STAKE"
            onClick={() => showStakeModal(true)}
            rest={{ color: 'blue.dark', width: '88px', height: '32px', fontSize: '10px', lineHeight: '11px' }}
          />
        </Flex>
        <Divider />
        <Flex direction="row" alignItems="center" py="18px">
          <Flex direction="column" flex="1">
            <Text fontSize="12px" lineHeight="18px" fontWeight="400" color="gray.quaternary" mb="4px">
              Total KEX Staked
            </Text>
            {stakedBalance === undefined && <Button isLoading variant="ghost" height="16px" width="fit-content" color="gray.secondary" />}
            {stakedBalance !== undefined && (
              <Text fontSize="14px" lineHeight="15.82px" color="gray.secondary" fontWeight="600">
                {(+stakedBalance.toFixed(0)).toLocaleString()}
              </Text>
            )}
          </Flex>
          <OutlinedButton
            text="UNSTAKE"
            onClick={() => showUnstakeModal(true)}
            rest={{ color: 'blue.dark', width: '88px', height: '32px', fontSize: '10px', lineHeight: '11px' }}
          />
        </Flex>
        <Flex direction="row" mr="10" alignItems="center" py="18px">
          <CollectionIcon />
          <Button
            color="gray.secondary"
            variant="link"
            fontSize="12px"
            lineHeight="13.56px"
            fontWeight="600"
            ml="12px"
            _focus={{ boxShadow: 'none' }}
            onClick={() => navigateTo('/mycollection')}
          >
            MY COLLECTION
          </Button>
        </Flex>
        <Divider />
        <Flex direction="row" mr="10" alignItems="center" py="18px">
          <LogOutIcon ml="-3px" />
          <Button
            color="gray.secondary"
            variant="link"
            fontSize="12px"
            lineHeight="13.56px"
            fontWeight="600"
            ml="8px"
            _focus={{ boxShadow: 'none' }}
            onClick={() => onDisconnectWallet()}
          >
            LOG OUT
          </Button>
        </Flex>
      </PopoverBody>
    </PopoverContent>
  );

  return (
    <>
      <Flex direction="row" cursor="pointer" alignItems="center" display={{ base: 'none', md: 'flex' }}>
        <Divider orientation="vertical" opacity="0.2" border="1px solid" height="32px" mr={{ base: '20px', lg: '40px', xl: '50px' }} />

        <Flex direction="row" mr={{ base: '20px', lg: '40px', xl: '50px' }} alignItems="center">
          <Image src={IMG_CRYSTAL} alt="K" width="3" marginRight="2" />
          {krystalBalance === undefined && <Button isLoading variant="ghost" width="fit-content" />}
          {krystalBalance !== undefined && (
            <Text fontSize="small" color="white" fontWeight="semibold">
              {(+krystalBalance.toFixed(0)).toLocaleString()}
            </Text>
          )}
        </Flex>
        <Flex direction="row" display={{ base: 'none', lg: 'flex' }} mr={{ base: '20px', lg: '40px', xl: '50px' }} alignItems="center">
          <Image src={IMG_KEX} alt="K" width="3" marginRight="2" />
          {stakedBalance === undefined && <Button isLoading variant="ghost" width="fit-content" />}
          {stakedBalance !== undefined && (
            <Text fontSize="small" color="white" fontWeight="semibold">
              {(+stakedBalance.toFixed(0)).toLocaleString()}
            </Text>
          )}
        </Flex>
        <Popover closeOnBlur isOpen={isOpen} onClose={close} placement="bottom-end">
          <PopoverTrigger>
            <Flex direction="row" alignItems="center" onClick={open}>
              <Text fontSize="small" color="white" fontWeight="semibold">
                {shortenAddress(account || '', 8)}
              </Text>
              <TriangleDownIcon color="white" w="4" h="2" />
            </Flex>
          </PopoverTrigger>
          {popoverContent(false)}
        </Popover>
      </Flex>
      <Menu>
        <Popover closeOnBlur isOpen={isOpenMobile} onClose={closeMobile} placement="auto-start" offset={[60, 20]}>
          <PopoverTrigger>
            <IconButton
              aria-label="Menu"
              mr="18px"
              icon={<Image src={SVG_USER} />}
              colorScheme="blue.dark"
              display={{ base: 'inherit', md: 'none' }}
              onClick={openMobile}
            />
          </PopoverTrigger>
          {popoverContent(true)}
        </Popover>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<Image src={SVG_HAMBURGER} />}
          colorScheme="blue.dark"
          display={{ base: 'inherit', md: 'none' }}
        />
        <MenuList bgColor="gray.700" display={{ base: 'inherit', md: 'none' }}>
          {HEADER_MENUS.map(({ label }, index) => (
            <MenuItem key={label} _hover={{ bg: 'whiteAlpha.100' }} _focus={index === 0 ? { bg: 'whiteAlpha.100' } : {}}>
              {label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      <StakeKexModal
        data={data}
        isOpen={isOpenStakeModal}
        onClose={() => showStakeModal(false)}
        onConfirm={() => {
          showStakeModal(false);
        }}
      />
      <StakeKexModal
        data={data}
        isOpen={isOpenUnstakeModal}
        onClose={() => showUnstakeModal(false)}
        onConfirm={() => {
          showUnstakeModal(false);
        }}
        stake={false}
      />
    </>
  );
};

export default ProfileNavButton;
