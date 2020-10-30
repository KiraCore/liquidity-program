import Web3 from 'web3'
import { provider } from 'web3-core'
import { AbiItem } from 'web3-utils'
import KiraAuctionAbi from '../kira/lib/abi/kira_auction.json'

export const getContract = (provider: provider, address: string) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    (KiraAuctionAbi as unknown) as AbiItem,
    address,
  )
  return contract
}

export const getAuctionConfig = async (
  provider: provider,
  contractAddress: string,
): Promise<string> => {
  const auctionContract = getContract(provider, contractAddress)
  try {
    const auctionConfig: string = await auctionContract.methods
      .getAuctionConfigInfo()
      .call()
    return auctionConfig
  } catch (e) {
    return '0'
  }
}
