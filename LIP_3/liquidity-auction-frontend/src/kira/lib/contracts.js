import KiraAbi from './abi/kira.json'
import KiraAuctionAbi from './abi/kira_auction.json'

import {
  contractAddresses,
} from './constants.js'
import * as Types from './types.js'

export class Contracts {
  constructor(provider, networkId, web3, options) {
    this.web3 = web3
    this.defaultConfirmations = options.defaultConfirmations
    this.autoGasMultiplier = options.autoGasMultiplier || 1.5
    this.confirmationType =
      options.confirmationType || Types.ConfirmationType.Confirmed
    this.defaultGas = options.defaultGas
    this.defaultGasPrice = options.defaultGasPrice

    this.kira = new this.web3.eth.Contract(KiraAbi)
    this.kiraAuction = new this.web3.eth.Contract(KiraAuctionAbi)

    this.setProvider(provider, networkId)
  }

  setProvider(provider, networkId) {
    const setProvider = (contract, address) => {
      contract.setProvider(provider)
      if (address) contract.options.address = address
      else console.error('Contract address not found in network', networkId)
    }

    setProvider(this.kira, contractAddresses.kira[networkId])
    setProvider(this.kiraAuction, contractAddresses.kiraAuction[networkId])
  }

  setDefaultAccount(account) {
    this.kira.options.from = account
  }
}
