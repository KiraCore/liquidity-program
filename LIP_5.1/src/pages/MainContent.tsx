/* eslint-disable react-hooks/exhaustive-deps */
import { Box } from '@chakra-ui/layout';
import { useEffect, useState } from 'react';
import { NFTMintModal } from 'src/components/modals';
import { useContracts } from 'src/hooks/useContracts';
import HeroSection from 'src/pages/sections/Hero';
import { Card, NFT } from 'src/types/nftTypes';
import { QueryDataTypes } from 'src/types/queryDataTypes';
import { commonCollection, uncommonCollection } from 'src/utils/nfts';
import CollectionSection from './sections/Collection';
import StorySection from './sections/Story';

type MainContentProps = {
  data: QueryDataTypes;
};

const MainContent = ({ data }: MainContentProps) => {
  const [isOpenMintModal, openMintModal] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const { nft } = useContracts();
  const [cardInfo, setCardInfo] = useState<{ [key: string]: Card }>({});

  async function updateInfo() {
    const cards = await Promise.all(commonCollection.nfts.map(({ id }: NFT) => nft.cards(id)));

    // TODO: Debug only logs
    console.log("MainContext.txs => updateInfo:")
    console.log({cards: cards})

    const cardInfo: { [key: string]: Card } = {};
    cards.forEach((card: Card, index: number) => {
     
      //commonCollection.nfts[index].image = card.metadata.image
     
      cardInfo[commonCollection.nfts[index].id] = card;
    });

    setCardInfo({ ...cardInfo });
  }

  useEffect(() => {
    setCardInfo({});
    updateInfo();
  }, []);

  const loadCardInfo = () => {
    setCardInfo({});
    updateInfo();
  };

  const showMintModal = (id: number) => {
    setSelectedId(id);
    openMintModal(true);
  };

  const selectedNft = selectedId ? [...commonCollection.nfts, ...uncommonCollection.nfts].find((nft) => nft.id === selectedId) : undefined;
  const selectedCardInfo = selectedId ? cardInfo[selectedId] : undefined;
  return (
    <Box minHeight="calc(100vh - 350px)" bgImage="url('/images/bg.svg')" bgPosition="top left" bgRepeat="no-repeat">
      <HeroSection data={data} />
      <StorySection />
      <CollectionSection collection={commonCollection} cardInfo={cardInfo} onMint={showMintModal} data={data} />
      <CollectionSection collection={uncommonCollection} cardInfo={{}} onMint={showMintModal} data={data} />
      {selectedId !== undefined && (
        <NFTMintModal
          data={data}
          isOpen={isOpenMintModal}
          onClose={() => openMintModal(false)}
          loadCardInfo={loadCardInfo}
          nftId={selectedId}
          nftInfo={selectedNft}
          cardInfo={selectedCardInfo}
        />
      )}
    </Box>
  );
};

export default MainContent;
