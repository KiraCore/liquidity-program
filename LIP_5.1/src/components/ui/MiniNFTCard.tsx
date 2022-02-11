import { Image } from '@chakra-ui/image';
import { Box, Flex, Heading, Text } from '@chakra-ui/layout';
import { IMG_KEX, SVG_INSTANCE } from 'src/assets/images';
import { Card, Owned } from 'src/types/nftTypes';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/toast';
import { useContracts } from 'src/hooks/useContracts';
import OutlinedButton from './OutlinedButton';
import PrimaryButton from './PrimaryButton';
import { useWallet } from 'use-wallet';
import { BigNumber } from '@ethersproject/bignumber';
import { Button } from '@chakra-ui/button';

type MiniNFTCardProps = {
  card: Card;
  owned: Owned;
  onStake: (nftId: number) => any;
  reloadMyCollection: () => any;
};

const MiniNFTCard = ({ owned, card, onStake, reloadMyCollection }: MiniNFTCardProps) => {
  const { nftStaking } = useContracts();
  const [loading, setLoading] = useState<boolean>(false);
  const { account } = useWallet();
  const toast = useToast();
  const [claimable, setClaimable] = useState<BigNumber | undefined>(undefined);

  const image = card?.metadata?.image ? card.metadata.image : "/images/loading.png";
  const stakedBalance = owned.stakedBalance ? owned.stakedBalance : 0 ;
  const unstakedBalance = owned.unstakedBalance ? owned.unstakedBalance : 0 ;
  const id = owned.id;
  const name = card?.getName();
  const camp = card?.getCamp(); 
  const gender = card?.getGender();
  const type = card?.getType();

  const isLoading = !!loading || !name;
  const canStake = !isLoading && unstakedBalance > 0;
  const canUnstake = !isLoading && stakedBalance > 0;
  const canClaim = false;

  const short_description = !isLoading ? `${name} | ${camp}` : "Loading from IPFS...";

  //{(+claimable).toLocaleString()} KEX Claimable
  //console.log("MiniNFTCard.txs => MiniNFTCard:");
  //console.log({id: id, stakedBalance: stakedBalance, unstakedBalance: unstakedBalance, card: card });

  const reloadClaimable = useCallback(() => {
    if (account) {
      setClaimable(undefined);
      nftStaking.rewardOf(id, account).then((reward: BigNumber) => {
        setClaimable(reward);
      });
    }
  }, [id, account, nftStaking]);

  useEffect(() => {
    reloadClaimable();
  }, [id, account, reloadClaimable]);

  const onUnstake = async () => {
    setLoading(true);
    try {
      const txStake = await nftStaking.unstake(id);
      toast({
        title: 'Pending Transaction',
        description: `Unstaking NFT (Id: ${id})`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      await txStake.wait();
      toast({
        title: 'Transaction Done',
        description: `Unstaked NFT(Id: ${id})`,
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
      const txStake = await nftStaking.claimReward(id);
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
      reloadClaimable();
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
      <Box height="201px">
        {/* <Image src={image} objectFit="cover" alt={title} height="100%" /> */}
        <LazyLoadImage src={image} height="100%" effect="blur" alt={card?.metadata?.name} style={{ objectFit: 'cover', height: '100%' }} />
        
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
            <OutlinedButton text="UNSTAKE" onClick={onUnstake} rest={{ width: '105px', height: '36px', isLoading: isLoading, disabled: !canUnstake }} />
            <OutlinedButton text="STAKE" onClick={() => onStake(id)} rest={{ width: '105px', height: '36px', isLoading: isLoading, disabled: !canStake }} />
          </Flex>
      </Box>

      <Box py="8px" px="25px">
        <Flex direction="row" alignItems="center" marginBottom="10px" >
            <Box flex="1">
              <Flex direction="row" alignItems="center">
                <Image src={IMG_KEX} width="3" mr="8px" />
                <Text fontSize="small" color="white">
                  ???'??? KEX
                </Text>
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
