import { Image } from '@chakra-ui/image';
import { Box, Flex, Heading, Text } from '@chakra-ui/layout';
import { IMG_KEX, SVG_INSTANCE } from 'src/assets/images';
import { BALANCE, Card, Owned, POOL } from 'src/types/nftTypes';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/toast';
import { useContracts } from 'src/hooks/useContracts';
import OutlinedButton from './OutlinedButton';
import PrimaryButton from './PrimaryButton';
import { useWallet } from 'use-wallet';
import { BigNumber } from '@ethersproject/bignumber';
import { Button } from '@chakra-ui/button';
import { ListItem, UnorderedList } from '@chakra-ui/react';

type MiniNFTCardProps = {
  card: Card;
  unstakedBalance: Number;
  pool: POOL;
  balance: BALANCE;
  kexDecimals: number;
  onStake: (card: Card, pool: POOL) => any;
  reloadMyCollection: () => any;
};

const MiniNFTCard = ({ unstakedBalance, card, pool, balance, kexDecimals, onStake, reloadMyCollection }: MiniNFTCardProps) => {
  const { nftStaking } = useContracts();
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const decimalFactor = Math.pow(10,kexDecimals);

  const image = card?.metadata?.image ? card.metadata.image : "/images/loading.png";
  
  const nftId = Number.parseInt(card?.getID());
  const name = card?.getName();
  const camp = card?.getCamp(); 
  const rarity = card?.getRarity(); 

  const isPoolActive = (pool?.isUndefined() ?? true) ? false : true;
  const isBalanceActive = (balance?.isUndefined() ?? true) ? false : true; 

  const stakedBalance = isBalanceActive ? balance.amount : 0 ;
  const rewardsToClaim = (isBalanceActive ? balance.rewardsToClaim : 0);
  
  const isLoading = !!loading || !name;
  const canStake = !isLoading && unstakedBalance > 0 && isPoolActive;
  const canUnstake = !isLoading && stakedBalance > 0 && isBalanceActive;
  const canClaim = !isLoading && rewardsToClaim > 0;
  const claimable = rewardsToClaim/decimalFactor;

  const short_description = !isLoading ? `${name} | ${camp}` : "Loading from IPFS gateway...";
  
  const long_description = !isLoading ? (isPoolActive ? `${name} | Staking Pool` : "Staking Pool Unavailable") : 
    "Loading from IPFS gateway, please wait, it might take a while...";

  const maxPerClaim = pool?.totalRewards ? pool.maxPerClaim/decimalFactor : 0;
  const maxFairClaim = (pool?.totalStakes ?? 0) > 0 ? (pool.totalRewards/pool.totalStakes)/decimalFactor : 0;

  const poolAttributes = (isLoading || !isPoolActive) ? [] : [
    { name: "Pool ID",
      value: `${pool?.poolId ?? "???"}`
    },{ 
      name: "Token ID",
      value: `${pool?.nftTokenId ?? "???"}`
    },{ 
      name: "Total Staked",
      value: `${pool?.totalStakes ?? "???"}/${card?.sold ?? "???"}`
    },{ 
      name: "Unclaimed",
      value: `${((pool?.totalRewards ?? 0)/decimalFactor).toFixed(0).toLocaleString()} KEX`
    },{
      name: "Avg. Rate",
      value: `${(((pool?.rewardPerNFT ?? 0)/decimalFactor)/((pool?.rewardPeriod ?? Number.MAX_SAFE_INTEGER)/3600)).toFixed(3).toLocaleString()} KEX/h`
    },{ 
      name: "Max Claim",
      value: `${Math.min(maxPerClaim,(pool?.totalStakes ?? 0) > 0 ? maxFairClaim : maxPerClaim).toFixed(0).toLocaleString()} KEX`
    }
  ];

  console.log("MiniNFTCard.txs => MiniNFTCard:");
  console.log({
    id: card?.getID(), 
    isLoading: isLoading,
    canStake: canStake,
    canUnstake: canUnstake,
    stakedBalance: stakedBalance, 
    unstakedBalance: unstakedBalance, 
    isPoolActive: isPoolActive,
    isBalanceActive: isBalanceActive,
    card: card,
    pool: pool });


  const onUnstake = async () => {
    setLoading(true);
    try {
      const txStake = await nftStaking.unstake(pool.poolId,balance.amount);
      toast({
        title: 'Pending Transaction',
        description: `Unstaking NFT (Id: ${nftId})`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      await txStake.wait();
      toast({
        title: 'Transaction Done',
        description: `Unstaked NFT(Id: ${nftId})`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      reloadMyCollection();
    } catch (e: any) {
      toast({
        title: 'Transaction Failed',
        description: e.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const onClaim = async () => {
    setLoading(true);
    try {
      const txStake = await nftStaking.claimReward(pool.poolId);
      toast({
        title: 'Pending Transaction',
        description: `Claiming Rewards`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      await txStake.wait();
      toast({
        title: 'Transaction Done',
        description: `Claimed Rewards`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      reloadMyCollection();
    } catch (e: any) {
      toast({
        title: 'Transaction Failed',
        description: e.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Box
      width="264px"
      borderRadius="10px"
      background="rgba(255, 255, 255, 0.05)"
      overflow="hidden"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        borderRadius: '10px',
        padding: '2px',
        background: 'linear-gradient(to bottom, #47A7FF, #1E2CB1)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'destination-out',
        maskComposite: 'exclude',
      }}
      mx="auto"
    >

      <Box
        position="absolute"
        left="0px"
        top="0px"
        w="calc(100% - 4px)"
        height={{ base: '320px', md: '285px' }}
        margin="2px"
        bg="#060817"
        opacity={0}
        _hover={{
          opacity: 0.94,
        }}
        transition="opacity 0.5s"
        color="white"
        padding={{ base: '18px', md: '24px' }}
        display="flex"
        flexDir="column"
      >
      <Text
          fontSize="14px"
          color="white"
          fontWeight="normal"
          lineHeight="150%"
          mb={{ base: '16px', md: '32px' }}
          overflow="hidden"
          sx={{
            base: {
              display: '-webkit-box',
              '-webkit-line-clamp': '2',
              '-webkit-box-orient': 'vertical',
            },
            md: {
              display: '-webkit-box',
              '-webkit-line-clamp': '4',
              '-webkit-box-orient': 'vertical',
            },
          }}
        >
          {long_description}
        </Text>
        <UnorderedList listStyleType="none" ml="0">
          {poolAttributes?.map((attr) => (
            <ListItem display="flex" mb="8px" fontSize="14px" key={attr.name}>
              <Text fontWeight="600">{attr.name}:&nbsp;</Text>
              {attr.value}
            </ListItem>
          ))}
        </UnorderedList>
      </Box>

      <Box height="201px">
        {/* <Image src={image} objectFit="cover" alt={title} height="100%" /> */}
        <LazyLoadImage src={image} height="100%" effect="blur" alt={card?.getName()} style={{ objectFit: 'cover', height: '100%' }} />
        
      </Box>

      <Box py="8px" px="20px">
      <Heading as="h4" fontSize="16px" lineHeight="16px" mb="12px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
          {short_description}
        </Heading>
      </Box>

      <Box py="0px" px="20px">
          <Flex direction="row" alignItems="center" mb="8px">
            <Image src={SVG_INSTANCE} width="3" mr="8px" />
            <Text fontSize="12px" color="white">
              {unstakedBalance} unstaked {unstakedBalance == 1 ? 'card' : 'cards'}
            </Text>
          </Flex>
          <Flex direction="row" alignItems="center" mb="8px">
            <Image src={SVG_INSTANCE} width="3" mr="8px" />
            <Text fontSize="12px" color="white">
              {stakedBalance} staked {stakedBalance == 1 ? 'card' : 'cards'}
            </Text>
          </Flex>
          <Flex direction="row" alignItems="center" justifyContent="space-between">
            <OutlinedButton text="UNSTAKE ALL" onClick={onUnstake} rest={{ width: '105px', height: '36px', isLoading: isLoading, disabled: !canUnstake }} />
            <OutlinedButton text="STAKE" onClick={() => onStake(card, pool)} rest={{ width: '105px', height: '36px', isLoading: isLoading, disabled: !canStake }} />
          </Flex>
      </Box>

      <Box py="8px" px="25px">
        <Flex direction="row" alignItems="center" marginBottom="10px" >
            <Box flex="1">
              <Flex direction="row" alignItems="center">
                <Image src={IMG_KEX} width="3" mr="8px" />
                {(isLoading) && <Button isLoading variant="ghost" width="fit-content" color="white" height="16px" />}
                {(!isLoading) && (
                  <Text fontSize="small" color="white" fontWeight="semibold" mr="8px">
                    {(claimable < 1) && ((rewardsToClaim/decimalFactor).toFixed(3)).toLocaleString()}
                    {(claimable >= 1 && claimable < 10) && ((rewardsToClaim/decimalFactor).toFixed(2)).toLocaleString()}
                    {(claimable >= 10 && claimable < 100) && ((rewardsToClaim/decimalFactor).toFixed(1)).toLocaleString()}
                    {(claimable >= 100) && ((rewardsToClaim/decimalFactor).toFixed(0)).toLocaleString()}
                    &nbsp;KEX 
                  </Text>
                )}
              </Flex>
            </Box>
          <Box flex="1">
            <OutlinedButton text="CLAIM" onClick={onClaim} rest={{ left: '8px', width: '105px', height: '36px', isLoading: isLoading, disabled: !canClaim }} />
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default MiniNFTCard;
