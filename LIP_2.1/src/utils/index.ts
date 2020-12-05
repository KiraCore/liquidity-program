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
    const targetURL = `https://oracle-kira-network.s3.eu-central-1.amazonaws.com/tickers/eth/latest.json`;
    const response = await fetch(targetURL, {
      headers: {
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Length',
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    return response.json();
  } catch (e) {
    return null
  }
}
