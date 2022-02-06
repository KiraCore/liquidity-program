import { Button } from '@chakra-ui/button';

type WalletConnectModalProps = {
  show?: boolean;
};

const WalletConnectModal = ({ show }: WalletConnectModalProps) => {
  return (
    <Button
      variant="outline"
      fontSize="small"
      color="white"
      borderColor="blue.500"
      borderWidth="2px"
      height="50px"
      _hover={{ bg: 'none', boxShadow: '0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)' }}
      _active={{ bg: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      Hello
    </Button>
  );
};

export default WalletConnectModal;
