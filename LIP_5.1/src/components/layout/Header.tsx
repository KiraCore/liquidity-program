/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Flex, Spacer } from '@chakra-ui/layout';

import { NavButton, NavMenuButton, ProfileNavButton, KiraLogo } from 'src/components/ui';
import { QueryDataTypes } from 'src/types/queryDataTypes';
import { HEADER_MENUS } from 'src/utils/constants';

type HeaderProps = {
  data: QueryDataTypes;
};

const Header = ({ data }: HeaderProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Flex
      w="100%"
      height="96px"
      color="white"
      bg={scrollPosition > 64 ? '#060817' : 'transparent'}
      alignItems="center"
      direction="row"
      paddingX={{ base: '20px', md: '30px', lg: '50px', xl: '140px' }}
      position="fixed"
      zIndex="1000"
    >
      <KiraLogo />
      <Spacer />
      <Flex direction="row" display={{ base: 'none', md: 'flex' }}>
        {HEADER_MENUS.map(({ label, active }) => (
          <NavButton text={label} key={label} active={active} />
        ))}
        <NavMenuButton options={['EN']} text="EN" />
      </Flex>
      <ProfileNavButton data={data} />
    </Flex>
  );
};

export default Header;
