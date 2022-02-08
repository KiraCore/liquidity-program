import { SimpleGrid } from '@chakra-ui/layout';
import { MiniNFTCard } from 'src/components/ui';
import { Card, NFT } from 'src/types/nftTypes';

type MiniCollectionSectionProps = {
  nfts: NFT[];
  staked: boolean;
  tier?: string;
  onStake: (nftId: number) => any;
  reloadMyCollection: () => any;
  cardInfo: {
    [key: string]: Card;
  };
};

const MiniCollectionSection = ({ nfts, staked, tier, cardInfo, onStake, reloadMyCollection }: MiniCollectionSectionProps) => {
  return (
    <SimpleGrid minChildWidth="264px" spacingX="12px" spacingY="35px">
      {nfts
        ?.filter((nft: NFT) => (staked ? !!nft.stakedBalance : !!nft.unstakedBalance) && (!tier || tier === cardInfo[nft.id]?.metadata?.attributes?.find(x => x.trait_type == "Tier")?.value))
        .map((nft: NFT) => (
          <MiniNFTCard nft={nft} key={nft.id} card={cardInfo[nft.id]} staked={staked} onStake={onStake} reloadMyCollection={reloadMyCollection} />
        ))}
    </SimpleGrid>
  );
};

export default MiniCollectionSection;
