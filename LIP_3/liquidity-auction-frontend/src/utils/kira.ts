import Web3 from 'web3'
import { provider } from 'web3-core'
import { AbiItem } from 'web3-utils'
import KiraABI from '../kira/lib/abi/kira.json'

export const getContract = (provider: provider, address: string) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    (KiraABI as unknown) as AbiItem,
    address,
  )
  return contract
}

export const getBalance = async (
  provider: provider,
  tokenAddress: string,
  userAddress: string,
): Promise<string> => {
  const kiraTokenContract = getContract(provider, tokenAddress)
  try {
    const balance: string = await kiraTokenContract.methods
      .balanceOf(userAddress)
      .call()
    return balance
  } catch (e) {
    return '0'
  }
}

export const getInitialSupply = async (
  provider: provider,
  tokenAddress: string,
): Promise<string> => {
  const kiraTokenContract = getContract(provider, tokenAddress)
  try {
    const balance: string = await kiraTokenContract.methods
      .INITIAL_SUPPLY()
      .call()
    return balance
  } catch (e) {
    return '0'
  }
}
