import { SimpleGrid } from '@chakra-ui/layout';
import { MiniNFTCard } from 'src/components/ui';
import { Card, NFT, Owned } from 'src/types/nftTypes';

type MiniCollectionSectionProps = {
  nfts: NFT[];
  rarity?: string;
  onStake: (nftId: number) => any;
  reloadMyCollection: () => any;
  cardInfo: {
    [key: string]: Card;
  };
  ownInfo: { [key: string]: Owned };
};

const MiniCollectionSection = ({ nfts, rarity, cardInfo, ownInfo, onStake, reloadMyCollection }: MiniCollectionSectionProps) => {
  const filter = nfts?.filter((nft: NFT) => (!rarity || rarity === cardInfo[nft.id]?.getRarity()));
  return (
    <SimpleGrid minChildWidth="264px" spacingX="12px" spacingY="35px">
      {filter.map((nft: NFT) => (
          <MiniNFTCard key={nft.id} card={cardInfo[nft.id]} owned={ownInfo[nft.id]} onStake={onStake} reloadMyCollection={reloadMyCollection} />
        ))}
    </SimpleGrid>
  );
};

export default MiniCollectionSection;
