import { Button } from '@chakra-ui/button';

type PrimaryButtonProps = {
  text: String;
  onClick: () => void;
  rest?: any;
};

const PrimaryButton = ({ text, onClick, rest }: PrimaryButtonProps) => {
  return (
    <Button
      colorScheme="blue"
      fontSize="12px"
      lineHeight="13.2px"
      fontWeight="600"
      fontFamily="Axiforma"
      color="white"
      height="60px"
      letterSpacing="0.05em"
      background="linear-gradient(to right, #298DFF, #344AE6)"
      _hover={{ boxShadow: '0 0 11px rgba(41,142,255,.8)' }}
      _active={{ bg: 'linear-gradient(to right, #298DFF, #344AE6)', boxShadow: '0 0 11px rgba(52,74,246,.8)' }}
      _focus={{ boxShadow: 'none' }}
      onClick={onClick}
      {...rest}
    >
      {text}
    </Button>
  );
};

export default PrimaryButton;
