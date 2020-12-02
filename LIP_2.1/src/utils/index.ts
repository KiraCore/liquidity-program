import BigNumber from 'bignumber.js'

export { default as formatAddress } from './formatAddress'

export const bnToDec = (bn: BigNumber, decimals = 18): number => {
  return bn.dividedBy(new BigNumber(10).pow(decimals)).toNumber()
}

export const decToBn = (dec: number, decimals = 18) => {
  return new BigNumber(dec).multipliedBy(new BigNumber(10).pow(decimals))
}

export const getETHPriceInUSD = async (
): Promise<any> => {
  try { 
    const proxyURL = 'https://cors-anywhere.herokuapp.com/';
    const targetURL = `https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD`;
    const response = await fetch(proxyURL + targetURL, {
      headers: {
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Length',
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    let resData:any = response.json();
    return resData["USD"];
  } catch (e) {
    return null
  }
}
