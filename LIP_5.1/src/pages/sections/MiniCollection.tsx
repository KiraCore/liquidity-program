import { SimpleGrid } from '@chakra-ui/layout';
import { MiniNFTCard } from 'src/components/ui';
import { NFT } from 'src/types/nftTypes';

type MiniCollectionSectionProps = {
  nfts: NFT[];
  staked: boolean;
  tier?: string;
  onStake: (nftId: number) => any;
  reloadMyCollection: () => any;
};

const MiniCollectionSection = ({ nfts, staked, tier, onStake, reloadMyCollection }: MiniCollectionSectionProps) => {
  return (
    <SimpleGrid minChildWidth="264px" spacingX="12px" spacingY="35px">
      {nfts
        ?.filter((nft: NFT) => (staked ? !!nft.stakedBalance : !!nft.unstakedBalance) && (!tier || nft.tier === tier))
        .map((nft: NFT) => (
          <MiniNFTCard nft={nft} key={nft.id} staked={staked} onStake={onStake} reloadMyCollection={reloadMyCollection} />
        ))}
    </SimpleGrid>
  );
};

export default MiniCollectionSection;
