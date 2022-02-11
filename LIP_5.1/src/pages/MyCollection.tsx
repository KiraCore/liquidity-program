/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Container, Flex, Heading } from '@chakra-ui/layout';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/tabs';
import { useEffect, useState } from 'react';
import StakeNFTModal from 'src/components/modals/StakeNFTModal';
import { PrimaryButton } from 'src/components/ui';
import { useContracts } from 'src/hooks/useContracts';
import { Card, NFT, Owned } from 'src/types/nftTypes';
import { QueryDataTypes } from 'src/types/queryDataTypes';
import { getAllNFT } from 'src/utils/nfts';
import { useWallet } from 'use-wallet';
import MiniCollectionSection from './sections/MiniCollection';

type MyCollectionProps = {
  data: QueryDataTypes;
};

const MyCollection = ({ data }: MyCollectionProps) => {
  const { nft, nftStaking } = useContracts();
  const { account } = useWallet();
  const [ownInfo, setOwnInfo] = useState<{ [key: string]: Owned }>({});
  const [isOpenStakeModal, openStakeModal] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [cardInfo, setCardInfo] = useState<{ [key: string]: Card }>({});

  async function updateInfo() {
    if (!account) return;
    console.log("MyCollection.txs => updateInfo:")

    const allCollections = getAllNFT();
    const unstakedBalances = await Promise.all(getAllNFT().map(({ id }: NFT) => nft.balanceOf(account, id)));
    const stakedBalances = await Promise.all(getAllNFT().map(({ id }: NFT) => nftStaking.totalStakeOf(id, account)));
    const ownInfo: { [key: string]: Owned } = {};

    console.log({unstakedBalances: unstakedBalances, stakedBalances: stakedBalances })

    unstakedBalances.forEach((unstakedBalance: number, index: number) => {
      if (unstakedBalance > 0) {
        const id = allCollections[index].id;
        if (ownInfo[id]) ownInfo[id].unstakedBalance = unstakedBalance;
        else ownInfo[id] = { id: id, unstakedBalance: unstakedBalance };
      }});

    stakedBalances.forEach((stakedBalance: number, index: number) => {
      if (stakedBalance > 0) {
        const id = allCollections[index].id;
        if (ownInfo[id]) ownInfo[id].stakedBalance = stakedBalance;
        else ownInfo[id] = { id: id, stakedBalance: stakedBalance };
      }});

    
    console.log({ownInfo: ownInfo});
    setOwnInfo({ ...ownInfo });

    const allOwnedCards = await Promise.all(Object.entries(ownInfo).map(info => nft.cards(Number.parseInt(info[0]))));
    
    const allPools = await Promise.all(Object.entries(ownInfo).map(
      info => nftStaking.getPool(Number.parseInt(info[0]), account)
    ));


    const cardInfo: { [key: string]: Card } = {};
    allOwnedCards.forEach(card => {
        let id = card?.getID();
        if (id) {
          cardInfo[Number.parseInt(id)] = card;
        }
      });

    console.log({cardInfo: cardInfo, allPools: allPools});
    setCardInfo({ ...cardInfo });
  }

  useEffect(() => {
    setOwnInfo({});
    setCardInfo({});
    if (account) {
      updateInfo();
    }
  }, [account]);

  const nfts = getAllNFT().filter((item: NFT) => Object.entries(ownInfo).find(x => x[0] == item.id.toString()));

  /*const nfts: NFT[] = [...commonCollection.nfts]
    .map((item: NFT) => ({ ...item, stakedBalance: ownInfo[item.id]?.stakedBalance, unstakedBalance: ownInfo[item.id]?.unstakedBalance }))
    .filter((item: NFT) => !!item.stakedBalance || !!item.unstakedBalance);*/

  const collections = [
    { index: 0, rarity: null, label: 'ALL' },
    { index: 1, rarity: 'Common', label: 'COMMON' },
    { index: 2, rarity: 'Uncommon', label: 'UNCOMMON' },
    { index: 3, rarity: 'Rare', label: 'RARE' },
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
    reloadMyCollection: updateInfo,
    cardInfo: cardInfo,
    ownInfo: ownInfo
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
                  key={collection.rarity}
                  fontSize={{ base: '12px', md: '14px' }}
                >
                  {collection.label}
                </Tab>
              ))}
            </TabList>
          </Flex>

          <TabPanels>
            <TabPanel px="0" py="64px">
              <MiniCollectionSection {...options} />
            </TabPanel>
            <TabPanel px="0" py="64px">
              <MiniCollectionSection {...options} rarity="Common" />
            </TabPanel>
            <TabPanel px="0" py="64px">
              <MiniCollectionSection {...options} rarity="Uncommon" />
            </TabPanel>
            <TabPanel px="0" py="64px">
              <MiniCollectionSection {...options} rarity="Rare" />
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
