import { Box, Container, Heading, Spacer, Text } from '@chakra-ui/layout';
import { StakeKexModal } from 'src/components/modals';
import { PrimaryButton } from 'src/components/ui';
import { useModal } from 'src/hooks/useModal';
import { QueryDataTypes } from 'src/types/queryDataTypes';

type HeroSectionProps = {
  data: QueryDataTypes;
};

const HeroSection = ({ data }: HeroSectionProps) => {
  const { isOpenStakeModal, showStakeModal } = useModal();
  const onFarm = () => {
    showStakeModal(true);
  };
  return (
    <Box
      bgImage={{ base: "url('/images/hero2.svg')", md: "url('/images/hero.svg')" }}
      bgPosition={{ base: 'top 40px center', md: 'top 60px right -80px', lg: 'top right' }}
      bgRepeat="no-repeat"
      height={{ base: '55rem', md: '60rem' }}
      bgSize={{ base: 'auto', md: 'contain', lg: 'auto' }}
    >
      <Container pt={{ base: '124px', md: 36, lg: 48 }} maxW={{ md: '1080px', xl: '1160px', '2xl': '1400px' }} px={{ base: '40px', lg: 'unset' }}>
        <Box
          width={{ base: '100%', md: '375px', lg: '465px' }}
          textAlign={{ base: 'left', sm: 'center', md: 'left' }}
          maxWidth={{ base: 'unset', sm: '465px' }}
          mx={{ base: 'unset', sm: 'auto', md: 'unset' }}
        >
          <Heading as="h1" fontSize={{ base: '44px', md: '52px', lg: '58px' }} lineHeight={{ base: '52.8px', md: '65px', lg: '69.6px' }}>
            Genesis of Decentralized Finance
          </Heading>
          <Text fontSize="16px" lineHeight="26.24px" mt="6" color="gray.senary">
            The first network that hosts, powers and secures DeFi applications with value of real assets at stake.
          </Text>
          <PrimaryButton
            text="FARM CRYSTALS"
            onClick={onFarm}
            rest={{ width: '200px', display: { base: 'none', md: 'inherit' }, mt: { md: '36px', lg: '72px' } }}
          />
        </Box>
      </Container>
      <Spacer />
      <StakeKexModal
        data={data}
        isOpen={isOpenStakeModal}
        onClose={() => showStakeModal(false)}
        onConfirm={() => {
          showStakeModal(false);
        }}
      />
    </Box>
  );
};

export default HeroSection;
