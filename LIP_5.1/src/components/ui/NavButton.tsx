import { Box, Flex, Text } from '@chakra-ui/layout';

type NavButtonProps = {
  text: String;
  active?: boolean;
  size?: 'sm' | 'md';
  last?: boolean;
};

const NavButton = ({ text, active, size = 'sm', last }: NavButtonProps) => {
  const styles = {
    sm: {
      fontSize: '12px',
      fontWeight: '600',
    },
    md: {
      fontSize: '14px',
      fontWeight: '400',
    },
  };
  return (
    <Flex direction="column" mr={last ? 0 : { base: '25px', lg: '40px', xl: '50px' }} mb={{ base: '24px', md: 0 }} cursor="pointer" position="relative">
      <Text color={active ? 'white' : 'gray.quinary'} letterSpacing="0.05em" {...styles[size]}>
        {text}
      </Text>
      {active && <Box border="1px solid #344AE6" height="1px" position="absolute" bottom="-5" left="-10%" width="120%" />}
    </Flex>
  );
};

export default NavButton;
