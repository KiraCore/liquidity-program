import BigNumber from 'bignumber.js'
import cfgData from '../config.json';

const useTokenBalance = () => {
    const resCnf: any = cfgData; // Config Data

    if (!resCnf) {
      throw new Error("ERROR: Can't fetch Configuration Data");
    }

    return new BigNumber(resCnf["available"]); // KEX available for distribution
}

export default useTokenBalance
