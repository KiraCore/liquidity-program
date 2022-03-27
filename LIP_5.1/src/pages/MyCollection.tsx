/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Container, Flex, Heading } from '@chakra-ui/layout';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/tabs';
import { useEffect, useState } from 'react';
import StakeNFTModal from 'src/components/modals/StakeNFTModal';
import { PrimaryButton } from 'src/components/ui';
import { useContracts } from 'src/hooks/useContracts';
import { BALANCE, Card, NFT, Owned, POOL } from 'src/types/nftTypes';
import { QueryDataTypes } from 'src/types/queryDataTypes';
import { getAllNFT } from 'src/utils/nfts';
import { useWallet } from 'use-wallet';
import MiniCollectionSection from './sections/MiniCollection';

type MyCollectionProps = {
  data: QueryDataTypes;
};

const MyCollection = ({ data }: MyCollectionProps) => {
  const { nft, nftStaking, token } = useContracts();
  const { account } = useWallet();
  const [ownInfo, setOwnInfo] = useState<{ [key: string]: Owned }>({});
  const [isOpenStakeModal, openStakeModal] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<Card | undefined>(undefined);
  const [selectedPool, setSelectedPool] = useState<POOL | undefined>(undefined);
  const [cardInfo, setCardInfo] = useState<{ [key: string]: Card }>({});
  const [poolInfo, setPoolInfo] = useState<{ [key: string]: POOL }>({});
  const [balanceInfo, setBalanceInfo] = useState<{ [key: string]: BALANCE }>({});
  const [kexDecimals, setKexDecimals] = useState<number>(6);

  async function updateInfo() {
    if (!account) return;
    console.log("MyCollection.txs => updateInfo:")

    const allCollections = getAllNFT();
    const unstakedBalances = await Promise.all(getAllNFT().map(({ id }: NFT) => nft.balanceOf(account, id)));
    const stakedBalances = await Promise.all<BALANCE>(getAllNFT().map(({ id }: NFT) => nftStaking.getBalance(id, account)));
    const kexDecimals = await token.decimals();
    setKexDecimals(kexDecimals);

    const ownInfo: { [key: string]: Owned } = {};

    console.log({unstakedBalances: unstakedBalances, stakedBalances: stakedBalances })

    unstakedBalances.forEach((unstakedBalance: number, index: number) => {
      if (unstakedBalance > 0) {
        const id = allCollections[index].id;
        if (ownInfo[id]) ownInfo[id].unstakedBalance = unstakedBalance;
        else ownInfo[id] = { id: id, unstakedBalance: unstakedBalance };
      }});

    stakedBalances.forEach((stakedBalance: BALANCE, index: number) => {
      if (stakedBalance.amount > 0) {
        const id = allCollections[index].id;
        if (ownInfo[id]) ownInfo[id].stakedBalance = stakedBalance.amount;
        else ownInfo[id] = { id: id, stakedBalance: stakedBalance.amount };
      }});

    
    console.log({ownInfo: ownInfo});
    setOwnInfo({ ...ownInfo });

    const allOwnedCards = await Promise.all(Object.entries(ownInfo).map(info => nft.cards(Number.parseInt(info[0]))));
    const allOwnedPools = await Promise.all<POOL>(Object.entries(ownInfo).map(
      info => nftStaking.getPool(Number.parseInt(info[0]), account)
    ));
    const allOwnedBalances = await Promise.all<BALANCE>(Object.entries(ownInfo).map(
      info => nftStaking.getBalance(Number.parseInt(info[0]), account)
    ));

    const cardInfo: { [key: string]: Card } = {};
    const poolInfo: { [key: string]: POOL } = {};
    const balanceInfo: { [key: string]: BALANCE } = {};
    allOwnedCards.forEach(card => cardInfo[card.getID()] = card);
    allOwnedPools.forEach(pool => poolInfo[pool.nftTokenId.toString()] = pool);
    allOwnedBalances.forEach(balance => balanceInfo[balance.nftTokenId.toString()] = balance);

    console.log({allOwnedCards: allOwnedCards, allOwnedPools: allOwnedPools, allOwnedBalances: allOwnedBalances});
    setCardInfo({ ...cardInfo });
    setPoolInfo({ ...poolInfo });
    setBalanceInfo({ ...balanceInfo });
  }

  useEffect(() => {
    setOwnInfo({});
    setCardInfo({});
    setPoolInfo({});
    setBalanceInfo({});
    if (account) {
      updateInfo();
    }
  }, [account]);

  const nfts = getAllNFT().filter((item: NFT) => Object.entries(ownInfo).find(x => x[0] === item.id.toString()));

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

  const onStake = (card: Card, pool: POOL) => {
    setSelectedCard(card);
    setSelectedPool(pool);
    openStakeModal(true);
  };

  const options = {
    onStake,
    nfts,
    reloadMyCollection: updateInfo,
    cardInfo: cardInfo,
    ownInfo: ownInfo,
    poolInfo: poolInfo,
    balanceInfo: balanceInfo,
    kexDecimals: kexDecimals
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
      {(selectedCard !== undefined && selectedPool !== undefined)&& (
        <StakeNFTModal data={data} isOpen={isOpenStakeModal} onClose={() => openStakeModal(false)} card={selectedCard} pool={selectedPool} reloadMyCollection={updateInfo} />
      )}
    </Box>
  );
};

export default MyCollection;
