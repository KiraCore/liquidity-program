import { Box, Container, Heading, SimpleGrid, Text } from '@chakra-ui/layout';
import { NFTCard } from 'src/components/ui';
import { NFTCollection, NFT, Card } from 'src/types/nftTypes';
import { QueryDataTypes } from 'src/types/queryDataTypes';

type CollectionSectionProps = {
  collection: NFTCollection;
  onMint: (id: number) => any;
  cardInfo: {
    [key: string]: Card;
  };
  data: QueryDataTypes;
};

const CollectionSection = ({ collection, onMint, cardInfo, data }: CollectionSectionProps) => {
  const { title, description, nfts } = collection;
  return (
    <Container pt={{ base: '80px', md: '102px' }} maxW={{ md: '1080px', xl: '1160px', '2xl': '1400px' }} px={{ base: '40px', lg: 'unset' }}>
      <Box>
        <Heading as="h2" fontSize={{ base: '32px', md: '36px' }} lineHeight="50.4px" mb="4" textAlign={{ base: 'center', md: 'left' }}>
          {title}
        </Heading>
        <Text fontSize="14px" lineHeight="21px" color="gray.senary" width="50%" mb="12" display={{ base: 'none', md: 'inherit' }}>
          {description}
        </Text>
      </Box>
      <SimpleGrid minChildWidth={{ base: '270px', md: '356px' }} spacingX="20px" spacingY={{ base: '24px', lg: '56px' }}>
        {nfts?.map((nft: NFT) => (
          <NFTCard id={nft.id} key={nft.id} card={cardInfo[nft.id]} onMint={onMint} data={data} />
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default CollectionSection;
