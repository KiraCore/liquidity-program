/* eslint-disable react-hooks/exhaustive-deps */
import { Box } from '@chakra-ui/layout';
import { useEffect, useState } from 'react';
import { NFTMintModal } from 'src/components/modals';
import { useContracts } from 'src/hooks/useContracts';
import HeroSection from 'src/pages/sections/Hero';
import { Card, NFT } from 'src/types/nftTypes';
import { QueryDataTypes } from 'src/types/queryDataTypes';
import { commonCollection, rareCollection, uncommonCollection } from 'src/utils/nfts';
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
    const commonCards = Promise.all(commonCollection.nfts.map(({ id }: NFT) => nft.cards(id)));
    const uncommonCards = Promise.all(uncommonCollection.nfts.map(({ id }: NFT) => nft.cards(id)));
    const rareCards = Promise.all(rareCollection.nfts.map(({ id }: NFT) => nft.cards(id)));
    const cardsCollection = await Promise.all([ commonCards, uncommonCards, rareCards ]);

    console.log("MainContext.txs => updateInfo:")
    console.log({cardsCollection: cardsCollection})

    const cardInfo: { [key: string]: Card } = {};

    cardsCollection.forEach(cards  => {
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

    //cards.forEach((card: Card, index: number) => {
    //  cardInfo[commonCollection.nfts[index].id] = card;
    //});

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

  const selectedNft = selectedId ? [...commonCollection.nfts, ...uncommonCollection.nfts, ...rareCollection.nfts].find((nft) => nft.id === selectedId) : undefined;
  const selectedCardInfo = selectedId ? cardInfo[selectedId] : undefined;
  return (
    <Box minHeight="calc(100vh - 350px)" bgImage="url('/images/bg.svg')" bgPosition="top left" bgRepeat="no-repeat">
      <HeroSection data={data} />
      <StorySection />
      <CollectionSection collection={commonCollection} cardInfo={cardInfo} onMint={showMintModal} data={data} />
      <CollectionSection collection={uncommonCollection} cardInfo={{}} onMint={showMintModal} data={data} />
      <CollectionSection collection={rareCollection} cardInfo={{}} onMint={showMintModal} data={data} />
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
