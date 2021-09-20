import { Image } from '@chakra-ui/image';
import { Box, Flex, Text } from '@chakra-ui/layout';
import { IMG_KEX, SVG_INSTANCE } from 'src/assets/images';
import { NFT } from 'src/types/nftTypes';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/toast';
import { useContracts } from 'src/hooks/useContracts';
import OutlinedButton from './OutlinedButton';
import PrimaryButton from './PrimaryButton';
import { useWallet } from 'use-wallet';
import { BigNumber } from '@ethersproject/bignumber';
import { Button } from '@chakra-ui/button';

type MiniNFTCardProps = {
  nft: NFT;
  staked: boolean;
  onStake: (nftId: number) => any;
  reloadMyCollection: () => any;
};

const MiniNFTCard = ({ nft: { id, title, image, stakedBalance, unstakedBalance }, staked, onStake, reloadMyCollection }: MiniNFTCardProps) => {
  const { nftStaking } = useContracts();
  const [loading, setLoading] = useState<boolean>(false);
  const { account } = useWallet();
  const toast = useToast();
  const [claimable, setClaimable] = useState<BigNumber | undefined>(undefined);

  const reloadClaimable = () => {
    if (account) {
      setClaimable(undefined);
      nftStaking.rewardOf(id, account).then((reward: BigNumber) => {
        setClaimable(reward);
      });
    }
  };

  useEffect(() => {
    reloadClaimable();
  }, [id, account]);

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
        <LazyLoadImage src={image} height="100%" effect="blur" alt={title} style={{ objectFit: 'cover', height: '100%' }} />
      </Box>

      {staked && (
        <Box py="20px" px="20px">
          <Flex direction="row" alignItems="center" mb="8px">
            <Image src={SVG_INSTANCE} width="3" mr="8px" />
            <Text fontSize="12px" color="white">
              {stakedBalance} {!!stakedBalance && stakedBalance > 1 ? 'instances' : 'instance'}
            </Text>
          </Flex>
          <Flex direction="row" alignItems="center" mb="8px">
            <Image src={IMG_KEX} width="3" mr="8px" />
            <Text fontSize="small" color="white" mr="4px">
              25 KEX /
            </Text>
            <Text fontSize="small" color="gray.secondary">
              100 kex per month
            </Text>
          </Flex>
          <Flex direction="row" alignItems="center" mb="20px">
            <Image src={IMG_KEX} width="3" mr="8px" />
            {claimable === undefined && <Button isLoading variant="ghost" width="fit-content" />}
            {claimable !== undefined && (
              <Text fontSize="small" color="white" mr="4px">
                {(+claimable).toLocaleString()} KEX Claimable
              </Text>
            )}
          </Flex>
          <Flex direction="row" alignItems="center" justifyContent="space-between">
            <OutlinedButton text="UNSTAKE" onClick={onUnstake} rest={{ width: '105px', height: '36px', isLoading: loading, disabled: loading }} />
            <PrimaryButton
              text="CLAIM"
              onClick={onClaim}
              rest={{ background: 'linear-gradient(to bottom, #8493FF, #344AE6)', width: '105px', height: '36px', isLoading: loading, disabled: loading }}
            />
          </Flex>
        </Box>
      )}
      {!staked && (
        <Box py="20px" px="24px">
          <Flex direction="row" alignItems="center" mb="8px">
            <Image src={SVG_INSTANCE} width="3" mr="8px" />
            <Text fontSize="12px" color="white">
              {unstakedBalance} {!!unstakedBalance && unstakedBalance > 1 ? 'instances' : 'instance'}
            </Text>
          </Flex>
          <Flex direction="row" alignItems="center">
            <Box flex="1">
              <Flex direction="row" alignItems="center">
                <Image src={IMG_KEX} width="3" mr="8px" />
                <Text fontSize="small" color="white">
                  25 KEX
                </Text>
              </Flex>
            </Box>
            <Box flex="1">
              <OutlinedButton text="STAKE" onClick={() => onStake(id)} rest={{ width: '100%', height: '36px', fontSize: '12px', lineHeight: '13.2px' }} />
            </Box>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default MiniNFTCard;
