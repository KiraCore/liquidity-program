import cfgData from '../config.json';
import BigNumber from 'bignumber.js'


const useTokenInitialSupply = () => {
  const resCnf: any = cfgData; // Config Data
    if (!resCnf) {
      throw new Error("ERROR: Can't fetch Configuration Data");
    }

    return new BigNumber(resCnf["supply"]);
}

export default useTokenInitialSupply
