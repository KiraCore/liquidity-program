import { Box, Container, Heading, HStack, Stack, Text } from '@chakra-ui/layout';

const StorySection = () => {
  return (
    <>
      <Container
        mt={{ base: '-240px', lg: '-116px' }}
        mb="108px"
        maxW={{ md: '1080px', xl: '1160px', '2xl': '1400px' }}
        display={{ base: 'none', md: 'inherit' }}
        px={{ base: '40px', lg: 'unset' }}
      >
        <Heading as="h2" fontSize="36px" lineHeight="50.4px" mb="12">
          The Story
        </Heading>
        <HStack direction={['column', 'row']} spacing="8" alignItems="start">
          <Box flex="1">
            <Stack spacing={4}>
              <Text fontSize="14px" lineHeight="21px" color="gray.senary">
                The planet has plunged into financial chaos. Opposing monetary systems collide in a bitter war waged between KIRA, with its allies, and Attar
                and his army. Self-sovereignty and financial freedom of all humanity are at stake. Will KIRA triumph and set humankind free from fiscal slavery?
                Or will Attar succeed and subject humanity to thousands of years of digital surveillance and monetary control?
              </Text>
              <Text fontSize="14px" lineHeight="21px" color="gray.senary">
                Team KIRA believes that individuals should be free to transact with whomever they like in complete privacy and to be able to control their own
                money. Whereas Team Attar is adamant that humans can’t be trusted to govern their own affairs.
              </Text>
            </Stack>
          </Box>
          <Box flex="1">
            <Stack spacing={4}>
              <Text fontSize="14px" lineHeight="21px" color="gray.senary">
                That it is the duty of the new world to scrutinize every transaction in the interests of “public safety.”
              </Text>
              <Text fontSize="14px" lineHeight="21px" color="gray.senary">
                The final battle is poised to unfold in The City, with the spoils going to whichever faction can master the two powers: magic and technology.
              </Text>
              <Text fontSize="14px" lineHeight="21px" color="gray.senary">
                Attar’s army consists of Cyborgs and dark Mages. KIRA is led by Lilith, a powerful sorceress, and Asmodat, a tech expert, supported by White
                Hackers, Cyborgs and Mages, its allies and those interconnected by its interchain bridges.
              </Text>
            </Stack>
          </Box>
        </HStack>
      </Container>
      <Container
        mt="-80px"
        maxW={{ md: '1080px', xl: '1160px', '2xl': '1400px' }}
        display={{ base: 'inherit', md: 'none' }}
        maxWidth="500px"
        textAlign="center"
      >
        <Heading as="h2" fontSize="32px" lineHeight="51.33px" mb="24px" fontWeight="400">
          Kira is a financial hub connecting decentralized Web3 applications
        </Heading>
        <Text fontSize="16px" lineHeight="26.24px" color="gray.senary">
          As an integral part of the Web3 stack KIRA enables value settlement between dApps and largest interconnected networks in the cryptocurrency ecosystem.
          Thanks to uncapped value at stake originating from both real world and interchain space KIRA provides secure Layer 1 platform for deploying
          decentralized applications and issuing digital assets.
        </Text>
      </Container>
    </>
  );
};

export default StorySection;
