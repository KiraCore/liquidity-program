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
    const commonCards = await Promise.all(commonCollection.nfts.map(({ id }: NFT) => nft.cards(id)));
    const uncommonCards = await Promise.all(uncommonCollection.nfts.map(({ id }: NFT) => nft.cards(id)));
    const rareCards = await Promise.all(rareCollection.nfts.map(({ id }: NFT) => nft.cards(id)));

    // TODO: Remove, debug only
    // console.log("MainContext.txs => updateInfo:")
    // console.log({commonCards: commonCards, uncommonCards: uncommonCards, rareCards: rareCards})

    const cardInfo: { [key: string]: Card } = {};

    [ commonCards, uncommonCards, rareCards ].forEach(cards  => {
      cards.forEach(card => {
        let id = card?.metadata.attributes?.find(x => x.trait_type == "ID")?.value;
        if (id) {
          // console.info("MainContext.txs => updateInfo: Found card ", id, ", upadting info...")
          cardInfo[Number.parseInt(id)] = card;
        } else {
          console.warn("MainContext.txs => updateInfo: Could NOT find card with id: ", id)
          console.warn({card: card})
        }
      });
    });

    // TODO: Remove, debug only
    // console.log("MainContext.txs => updateInfo => cardInfos:")
    // console.log({cardInfo: cardInfo})

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
      <CollectionSection collection={uncommonCollection} cardInfo={cardInfo} onMint={showMintModal} data={data} />
      <CollectionSection collection={rareCollection} cardInfo={cardInfo} onMint={showMintModal} data={data} />
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
