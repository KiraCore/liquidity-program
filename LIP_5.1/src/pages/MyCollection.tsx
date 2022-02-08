/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Container, Flex, Heading } from '@chakra-ui/layout';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/tabs';
import { useEffect, useState } from 'react';
import StakeNFTModal from 'src/components/modals/StakeNFTModal';
import { PrimaryButton } from 'src/components/ui';
import { useContracts } from 'src/hooks/useContracts';
import { Card, NFT, Owned } from 'src/types/nftTypes';
import { QueryDataTypes } from 'src/types/queryDataTypes';
import { commonCollection, rareCollection, uncommonCollection } from 'src/utils/nfts';
import { useWallet } from 'use-wallet';
import MiniCollectionSection from './sections/MiniCollection';

type MyCollectionProps = {
  data: QueryDataTypes;
};

const MyCollection = ({ data }: MyCollectionProps) => {
  const [optStaked, setOptStaked] = useState<boolean>(false);

  const { nft, nftStaking } = useContracts();
  const { account } = useWallet();
  const [ownInfo, setOwnInfo] = useState<{ [key: string]: Owned }>({});
  const [isOpenStakeModal, openStakeModal] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [cardInfo, setCardInfo] = useState<{ [key: string]: Card }>({});

  async function updateInfo() {
    if (!account) return;
    const unstakedBalances = await Promise.all(commonCollection.nfts.map(({ id }: NFT) => nft.balanceOf(account, id)));
    const stakedBalances = await Promise.all(commonCollection.nfts.map(({ id }: NFT) => nftStaking.totalStakeOf(id, account)));
    const ownInfo: { [key: string]: Owned } = {};
    unstakedBalances.forEach((unstakedBalance: number, index: number) => {
      const id = commonCollection.nfts[index].id;
      if (ownInfo[id]) ownInfo[id].unstakedBalance = unstakedBalance;
      else ownInfo[id] = { unstakedBalance };
    });

    stakedBalances.forEach((stakedBalance: number, index: number) => {
      const id = commonCollection.nfts[index].id;
      if (ownInfo[id]) ownInfo[id].stakedBalance = stakedBalance;
      else ownInfo[id] = { stakedBalance };
    });

    setOwnInfo({ ...ownInfo });

    const commonCards = await Promise.all(commonCollection.nfts.map(({ id }: NFT) => nft.cards(id)));
    const uncommonCards = await Promise.all(uncommonCollection.nfts.map(({ id }: NFT) => nft.cards(id)));
    const rareCards = await Promise.all(rareCollection.nfts.map(({ id }: NFT) => nft.cards(id)));

    console.log("MyCollection.txs => updateInfo:")
    console.log({commonCards: commonCards, uncommonCards: uncommonCards, rareCards: rareCards})

    const cardInfo: { [key: string]: Card } = {};

    [commonCards, uncommonCards, rareCards].forEach(cards  => {
      cards.forEach(card => {
        let id = card?.metadata.attributes?.find(x => x.trait_type == "ID")?.value;
        if (typeof id !== undefined) {
          cardInfo[Number.parseInt(id as string)] = card;
        } else {
          console.warn("MainContext.txs => updateInfo: Could NOT find card id in attributes!")
          console.warn({card: card})
        }
      });
    });

    setCardInfo({ ...cardInfo });
  }

  useEffect(() => {
    setOwnInfo({});
    setCardInfo({});
    if (account) {
      updateInfo();
    }
  }, [account]);

  const nfts: NFT[] = [...commonCollection.nfts]
    .map((item: NFT) => ({ ...item, stakedBalance: ownInfo[item.id]?.stakedBalance, unstakedBalance: ownInfo[item.id]?.unstakedBalance }))
    .filter((item: NFT) => !!item.stakedBalance || !!item.unstakedBalance);

  const collections = [
    { index: 0, tier: null, label: 'ALL' },
    { index: 1, tier: 'Common', label: 'COMMON' },
    { index: 2, tier: 'Uncommon', label: 'UNCOMMON' },
    { index: 3, tier: 'Rare', label: 'RARE' },
  ];

  const optStyle = {
    normal: {
      width: '112px',
      height: '48px',
      letterSpacing: '2px',
      ml: '24px',
      fontSize: { base: '12px', md: '14px' },
    },
    unselected: {
      background: 'none',
      variant: 'ghost',
    },
  };

  const onStake = (nftId: number) => {
    setSelectedId(nftId);
    openStakeModal(true);
  };

  const options = {
    onStake,
    nfts,
    staked: optStaked,
    reloadMyCollection: updateInfo,
    cardInfo: cardInfo,
  };

  return (
    <Box minHeight="calc(100vh - 350px)" mt="96px">
      <Container mt="64px" maxW={{ md: '1080px', xl: '1160px', '2xl': '1400px' }}>
        <Heading as="h2" fontSize="36px" lineHeight="50.4px" mb="40px" textAlign={{ base: 'center', md: 'left' }}>
          My Collection
        </Heading>
        <Tabs>
          <Flex direction={{ base: 'column', lg: 'row' }} alignItems={{ base: 'flex-start', lg: 'center' }} justifyContent="space-between">
            <TabList border="none" mx={{ base: 'auto', md: 'unset' }}>
              {collections.map((collection) => (
                <Tab
                  _focus={{ boxShadow: 'none' }}
                  _active={{ background: 'initial' }}
                  mr={{ base: '4px', md: '24px' }}
                  key={collection.tier}
                  fontSize={{ base: '12px', md: '14px' }}
                >
                  {collection.label}
                </Tab>
              ))}
            </TabList>
            <Flex direction="row" alignItems="center" ml={{ base: 'auto', lg: 'unset' }} mr={{ base: 'auto', md: 'unset' }} mt={{ base: '36px', lg: 0 }}>
              <PrimaryButton
                text="UNSTAKED"
                onClick={() => setOptStaked(false)}
                rest={optStaked ? { ...optStyle.normal, ...optStyle.unselected, ml: 0 } : { ...optStyle.normal, ml: 0 }}
              />
              <PrimaryButton
                text="STAKED"
                onClick={() => setOptStaked(true)}
                rest={!optStaked ? { ...optStyle.normal, ...optStyle.unselected } : optStyle.normal}
              />
            </Flex>
          </Flex>

          <TabPanels>
            <TabPanel px="0" py="64px">
              <MiniCollectionSection {...options} />
            </TabPanel>
            <TabPanel px="0" py="64px">
              <MiniCollectionSection {...options} tier="Common" />
            </TabPanel>
            <TabPanel px="0" py="64px">
              <MiniCollectionSection {...options} tier="Uncommon" />
            </TabPanel>
            <TabPanel px="0" py="64px">
              <MiniCollectionSection {...options} tier="Rare" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
      {selectedId !== undefined && (
        <StakeNFTModal data={data} isOpen={isOpenStakeModal} onClose={() => openStakeModal(false)} nftId={selectedId} reloadMyCollection={updateInfo} />
      )}
    </Box>
  );
};

export default MyCollection;
