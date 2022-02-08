import { Image } from '@chakra-ui/image';
import { Box, Flex, Heading, ListItem, Text, UnorderedList } from '@chakra-ui/layout';
import { IMG_CRYSTAL, SVG_TELEGRAM_WHITE, SVG_TWITTER_WHITE } from 'src/assets/images';
import { Card, NFT, NFTAttributes, NFTMetadata } from 'src/types/nftTypes';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import OutlinedButton from './OutlinedButton';
import { Button } from '@chakra-ui/button';
import { useWallet } from 'use-wallet';
import { QueryDataTypes } from 'src/types/queryDataTypes';

type NFTCardProps = {
  id: number;
  onMint: (id: number) => any;
  card: Card;
  data: QueryDataTypes;
};

const NFTCard = ({ id, onMint, card, data }: NFTCardProps) => {
  const nKrystals = card ? card.value : undefined;
  const nMinted = card ? card.sold : undefined;
  const nTotal = card ? card.quantity : undefined;
  const { account } = useWallet();
  const { krystalBalance } = data;

  const mintDisabled =
    !account || nKrystals === undefined || nMinted === undefined || nTotal === undefined || !krystalBalance || parseInt(nKrystals.toString()) > krystalBalance;

  const attributes = card?.metadata?.attributes ? card.metadata.attributes : [
      { trait_type: "ID", value: id.toString() }  
    ];

  const name = card?.metadata?.name ? card.metadata.name : "???";
  const camp = attributes?.find(x => x.trait_type == "Camp")?.value;
  const gender = attributes?.find(x => x.trait_type == "Gender")?.value;
  const type = attributes?.find(x => x.trait_type == "Type")?.value;
  const short_description = `${name}, ${camp} - ${gender} ${type}`
  const long_description = card?.metadata?.description ? card.metadata.description : "Loading data, please be patient, this might take a while..." 
  const image = card?.metadata?.image ? card.metadata.image : "/images/loading.png"
  
  if (name == "???") {
    short_description = "Loading from IPFS gateway..."
  }

  // TODO: REMOVE LOGS, DEBUG ONLY
  console.log("NFTCard => render: ", id)
  console.log({name: name, image: image, short_description: short_description, card: card})

  return (
    <Box
      width={{ base: '270px', md: '356px' }}
      borderRadius="18px"
      background="rgba(255, 255, 255, 0.05)"
      overflow="hidden"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        borderRadius: '18px',
        padding: '2px',
        background: 'linear-gradient(to bottom, #47A7FF, #1E2CB1)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'destination-out',
        maskComposite: 'exclude',
      }}
      mx="auto"
    >
      <Box
        position="absolute"
        left="0px"
        top="0px"
        w="calc(100% - 4px)"
        height={{ base: '320px', md: '440px' }}
        margin="2px"
        bg="#060817"
        opacity={0}
        _hover={{
          opacity: 0.94,
        }}
        transition="opacity 0.5s"
        color="white"
        padding={{ base: '18px', md: '24px' }}
        display="flex"
        flexDir="column"
      >
        <Text
          fontSize="14px"
          color="white"
          fontWeight="normal"
          lineHeight="150%"
          mb={{ base: '16px', md: '32px' }}
          overflow="hidden"
          sx={{
            base: {
              display: '-webkit-box',
              '-webkit-line-clamp': '2',
              '-webkit-box-orient': 'vertical',
            },
            md: {
              display: '-webkit-box',
              '-webkit-line-clamp': '4',
              '-webkit-box-orient': 'vertical',
            },
          }}
        >
          {long_description}
        </Text>
        <UnorderedList listStyleType="none" ml="0">
          {attributes.map((attr) => (
            <ListItem display="flex" mb="8px" fontSize="14px" key={attr.trait_type}>
              <Text fontWeight="600">{attr.trait_type}:&nbsp;</Text>
              {attr.value}
            </ListItem>
          ))}
        </UnorderedList>
        <Flex direction="row" mt="auto" alignItems="center">
          <Text fontSize="16px" color="gray.quaternary" fontWeight="700" mr="16px">
            SHARE:
          </Text>
          <Image src={SVG_TWITTER_WHITE} alt="Twitter" cursor="pointer" mr="20px" color="white" />
          <Image src={SVG_TELEGRAM_WHITE} alt="Telegram" cursor="pointer" />
        </Flex>
      </Box>
      <Box height={{ base: '320px', md: '440px' }}>
        {/* <Image src={image} objectFit="cover" alt={short_description} height="100%" /> */}
        <LazyLoadImage src={image} height="100%" effect="blur" alt={short_description} style={{ objectFit: 'cover', height: '100%' }} />
      </Box>
      <Box height="196px" p={{ base: '18px', md: '24px' }}>
        <Heading as="h3" fontSize="20px" lineHeight="30px" mb="12px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
          {short_description}
        </Heading>
        <Flex direction="row" marginRight="10" alignItems="center" mb="40px">
          <Image src={IMG_CRYSTAL} width="3" marginRight="2" />
          {nKrystals === undefined && <Button isLoading variant="ghost" width="fit-content" color="white" height="16px" />}
          {nKrystals !== undefined && (
            <Text fontSize="small" color="white" fontWeight="semibold" mr="8px">
              {nKrystals}
            </Text>
          )}
          krystals
        </Flex>
        <Flex direction="row" alignItems="center">
          <Box flex="1">
            <OutlinedButton text="MINT" onClick={() => onMint(id)} rest={{ width: '100%', disabled: mintDisabled }} />
          </Box>
          <Box flex="1">
            <Flex direction="row" alignItems="center" justifyContent="center">
              {nMinted === undefined && <Button isLoading variant="ghost" width="fit-content" color="white" height="16px" />}
              {nMinted !== undefined && (
                <Text fontSize="small" color="white" fontWeight="semibold" mr="4px">
                  {nMinted}
                </Text>
              )}
              <Text fontSize="small" color="white" fontWeight="semibold" textAlign="center">
                MINTED OF
              </Text>
              {nTotal === undefined && <Button isLoading variant="ghost" width="fit-content" color="white" height="16px" />}
              {nTotal !== undefined && (
                <Text fontSize="small" color="white" fontWeight="semibold" ml="4px">
                  {nTotal}
                </Text>
              )}
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default NFTCard;
