import { SimpleGrid } from '@chakra-ui/layout';
import { MiniNFTCard } from 'src/components/ui';
import { Card, NFT } from 'src/types/nftTypes';

type MiniCollectionSectionProps = {
  nfts: NFT[];
  staked: boolean;
  rarity?: string;
  onStake: (nftId: number) => any;
  reloadMyCollection: () => any;
  cardInfo: {
    [key: string]: Card;
  };
};

const MiniCollectionSection = ({ nfts, staked, rarity, cardInfo, onStake, reloadMyCollection }: MiniCollectionSectionProps) => {
  return (
    <SimpleGrid minChildWidth="264px" spacingX="12px" spacingY="35px">
      {nfts
        ?.filter((nft: NFT) => (staked ? !!nft.stakedBalance : !!nft.unstakedBalance) && (!rarity || rarity === cardInfo[nft.id]?.getRarity()))
        .map((nft: NFT) => (
          <MiniNFTCard nft={nft} key={nft.id} card={cardInfo[nft.id]} staked={staked} onStake={onStake} reloadMyCollection={reloadMyCollection} />
        ))}
    </SimpleGrid>
  );
};

export default MiniCollectionSection;
