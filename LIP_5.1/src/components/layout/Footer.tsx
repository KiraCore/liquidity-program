import { Image } from '@chakra-ui/image';
import { Divider, Flex, Spacer, Text } from '@chakra-ui/layout';
import { SVG_TWITTER, SVG_GITHUB, SVG_MEDIUM, SVG_TELEGRAM } from 'src/assets/images';
import { NavButton, KiraLogo } from 'src/components/ui';
import { HEADER_MENUS } from 'src/utils/constants';

const Footer = () => {
  return (
    <Flex bg="#060817" w="100%" color="white" direction="column" mt="96px" paddingX={{ base: '30px', lg: '80px', xl: '140px' }}>
      <Flex alignItems={{ base: 'left', md: 'center' }} direction={{ base: 'column', md: 'row' }} py={{ base: '40px', lg: '64px' }}>
        <KiraLogo />
        <Spacer />

        <Flex direction={{ base: 'column', md: 'row' }} mt={{ base: '32px', md: 0 }}>
        {HEADER_MENUS.map(({ label, href }) => (
          <a href={href}>
            <NavButton text={label} key={label }size="md"/>
          </a>
        ))}
        </Flex>
        <Spacer />
        <a href="mailto:partners@kira.global">
          <Text fontSize="14px" color="gray.senary" letterSpacing="0.05em" cursor="pointer" mt={{ base: '8px', md: 0 }}>
            partners@kira.global &gt;
          </Text>
        </a>
      </Flex>
      <Divider borderColor="rgba(255, 255, 255, 0.1)" />
      <Flex alignItems={{ base: 'left', md: 'center' }} direction={{ base: 'column', md: 'row' }} py={{ base: '40px', md: '28px' }} mb="10px">
        <Flex direction={{ base: 'column', md: 'row' }} order={{ base: 2, md: 0 }} pt={{ base: '42px', md: 0 }}>
          {/* <Text fontSize="12px" color="gray.tertiary" letterSpacing="0.05em" mr="24px" mb={{ base: '24px', md: 0 }} cursor="pointer">
            User Terms
          </Text>
          <Text fontSize="12px" color="gray.tertiary" letterSpacing="0.05em" mr="24px" mb={{ base: '24px', md: 0 }} cursor="pointer">
            Privacy Policy
          </Text> */}
          <a target="_blank" rel="noreferrer" href="http://wp.kira.network/">
            <Text fontSize="12px" color="gray.tertiary" letterSpacing="0.05em" mb={{ base: '24px', md: 0 }} cursor="pointer">
              White Paper
            </Text>
          </a>
        </Flex>
        <Spacer order={1} />
        <Flex direction="row" width={{ base: '176px', md: '156px' }} justifyContent="space-between" alignItems="center" order={{ base: 0, md: 2 }}>
          <a target="_blank" rel="noreferrer" href="http://twitter.kira.network/">
            <Image src={SVG_TWITTER} alt="Twitter" cursor="pointer" />
          </a>
          <a target="_blank" rel="noreferrer" href="https://blog.kira.network/">
            <Image src={SVG_MEDIUM} alt="Medium" cursor="pointer" />
          </a>
          <a target="_blank" rel="noreferrer" href="http://github.com/KiraCore">
            <Image src={SVG_GITHUB} alt="Github" cursor="pointer" />
          </a>
          <a target="_blank" rel="noreferrer" href="http://tg.kira.network">
            <Image src={SVG_TELEGRAM} alt="Telegram" cursor="pointer" />
          </a>
        </Flex>
        <Spacer order={3} />
        <Text fontSize="12px" color="gray.tertiary" letterSpacing="0.05em" order={4} mt={{ base: '8px', md: 0 }}>
          2022 KIRA, Kira Global Inc. All rights reserved.
        </Text>
      </Flex>
    </Flex>
  );
};

export default Footer;
