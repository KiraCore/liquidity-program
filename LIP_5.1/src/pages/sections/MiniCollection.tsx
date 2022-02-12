import { SimpleGrid } from '@chakra-ui/layout';
import { MiniNFTCard } from 'src/components/ui';
import { BALANCE, Card, NFT, Owned, POOL } from 'src/types/nftTypes';

type MiniCollectionSectionProps = {
  nfts: NFT[];
  rarity?: string;
  onStake: (nftId: number) => any;
  reloadMyCollection: () => any;
  cardInfo: {
    [key: string]: Card;
  };
  ownInfo: { [key: string]: Owned };
  poolInfo: { [key: string]: POOL };
  balanceInfo: { [key: string]: BALANCE };
};

const MiniCollectionSection = ({ nfts, rarity, cardInfo, ownInfo, poolInfo, balanceInfo, onStake, reloadMyCollection }: MiniCollectionSectionProps) => {
  const filter = nfts?.filter((nft: NFT) => (!rarity || rarity === cardInfo[nft.id]?.getRarity()));
  return (
    <SimpleGrid minChildWidth="264px" spacingX="12px" spacingY="35px">
      {filter.map((nft: NFT) => (
          <MiniNFTCard key={nft.id} card={cardInfo[nft.id]} unstakedBalance={ownInfo[nft.id]?.unstakedBalance ?? 0} onStake={onStake} pool={poolInfo[nft.id]} balance={balanceInfo[nft.id]} reloadMyCollection={reloadMyCollection} />
        ))}
    </SimpleGrid>
  );
};

export default MiniCollectionSection;
