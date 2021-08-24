import { Image } from '@chakra-ui/image';
import { IMG_KIRA_LOGO } from 'src/assets/images';
import { useHistory } from 'react-router-dom';

const KiraLogo = () => {
  const { push } = useHistory();
  return <Image src={IMG_KIRA_LOGO} alt="KIRA" onClick={() => push('/')} cursor="pointer" h="30px" w="82.48px" />;
};

export default KiraLogo;
