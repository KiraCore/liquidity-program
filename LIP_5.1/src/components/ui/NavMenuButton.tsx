import { Flex, Text } from '@chakra-ui/layout';
import { TriangleDownIcon } from '@chakra-ui/icons';

type NavMenuButtonProps = {
  text: String;
  options: String[];
};

const NavMenuButton = ({ text, options }: NavMenuButtonProps) => {
  return (
    <Flex direction="row" mr={{ base: '10px', md: '20px', lg: '40px', xl: '50px' }} cursor="pointer" position="relative" alignItems="center">
      <Text fontSize="12px" color="gray.quinary" fontWeight="600" letterSpacing="0.05em">
        {text}
      </Text>
      <TriangleDownIcon color="gray.quinary" w="4" h="2" />
    </Flex>
  );
};

export default NavMenuButton;
