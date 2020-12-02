import BigNumber from 'bignumber.js'
import config from '../config'

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
    const APIKey = "Apikey {" + config.price_api_key + "}"
    const response = await fetch(proxyURL + targetURL, {
      headers: {
        'Accept': '*/*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Length',
        'Content-Type': 'application/json',
        'Authorization': APIKey,
      },
      method: 'GET',
    });
    console.log(response)
    let resData:any = response.json();
    return resData["USD"];
  } catch (e) {
    return null
  }
}
