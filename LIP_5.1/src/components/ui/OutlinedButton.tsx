import { Button } from '@chakra-ui/button';

type OutlinedButtonProps = {
  text: String;
  onClick: () => void;
  rest?: any;
};

const OutlinedButton = ({ text, onClick, rest }: OutlinedButtonProps) => {
  return (
    <Button
      variant="outline"
      fontSize="12px"
      color="white"
      borderColor="blue.500"
      borderWidth="2px"
      border="none"
      height="50px"
      letterSpacing="0.05em"
      position="relative"
      borderRadius="6px"
      _before={{
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        borderRadius: '6px',
        padding: '2px',
        background: 'linear-gradient(to right, #298DFF, #344AE6)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'destination-out',
        maskComposite: 'exclude',
      }}
      _hover={{ bg: 'none', boxShadow: '0 0 5px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)' }}
      _active={{ bg: 'none' }}
      _focus={{ boxShadow: 'none' }}
      onClick={onClick}
      {...rest}
    >
      {text}
    </Button>
  );
};

export default OutlinedButton;
