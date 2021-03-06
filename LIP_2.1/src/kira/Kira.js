import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import { Contracts } from './lib/contracts.js'
import { Account } from './lib/accounts.js'
import { EVM } from './lib/evm.js'
import { contractAddresses } from './lib/constants'
import { supportedPools } from './lib/constants'
import config from '../config'

export class Kira {
  constructor(provider, networkId = 42, testing, options) {
    var realProvider

    if (!provider) {
      console.log("INFURA HTTP PROVIDER URL: ", `https://${config.NETWORK}.infura.io/v3/${config.INFURA_PROJECT_ID}`)
      realProvider = new Web3.providers.HttpProvider(`https://${config.NETWORK}.infura.io/v3/${config.INFURA_PROJECT_ID}`)
    } else if (typeof provider === 'string') {
      if (provider.includes('wss')) {
        realProvider = new Web3.providers.WebsocketProvider(
          provider,
          options.ethereumNodeTimeout || 10000,
        )
      } else {
        realProvider = new Web3.providers.HttpProvider(
          provider,
          options.ethereumNodeTimeout || 10000,
        )
      }
    } else {
      realProvider = provider      
    }

    this.web3 = new Web3(realProvider)

    if (testing) {
      this.testing = new EVM(realProvider)
      this.snapshot = this.testing.snapshot()
    }

    if (options.defaultAccount) {
      this.web3.eth.defaultAccount = options.defaultAccount
    }

    this.contracts = new Contracts(realProvider, networkId, this.web3, options)
    this.kiraAddress = contractAddresses.kira[networkId]
    this.kiraStakingAddress = contractAddresses.kiraStaking[networkId]
    this.wethAddress = contractAddresses.weth[networkId]
    this.lpAddresses1 = supportedPools[0].lpAddresses[networkId]

    console.log(` KEX ERC20 Contract: ${this.kiraAddress}`);
    console.log(`WETH ERC20 Contract: ${this.wethAddress}`);
    console.log(`   Locking Contract: ${this.kiraStakingAddress}`);
    console.log(`LP Token 1 Contract: ${this.lpAddresses1}`);
    console.log(`            Network: ${config.NETWORK}`);
    console.log(`         Project ID: ${config.INFURA_PROJECT_ID}`);
  }

  async resetEVM() {
    this.testing.resetEVM(this.snapshot)
  }

  addAccount(address, number) {
    this.accounts.push(new Account(this.contracts, address, number))
  }

  setProvider(provider, networkId) {
    this.web3.setProvider(provider)
    this.contracts.setProvider(provider, networkId)
    this.operation.setNetworkId(networkId)
  }

  setDefaultAccount(account) {
    this.web3.eth.defaultAccount = account
    this.contracts.setDefaultAccount(account)
  }

  getDefaultAccount() {
    return this.web3.eth.defaultAccount
  }

  loadAccount(account) {
    const newAccount = this.web3.eth.accounts.wallet.add(account.privateKey)

    if (
      !newAccount ||
      (account.address &&
        account.address.toLowerCase() !== newAccount.address.toLowerCase())
    ) {
      throw new Error(`Loaded account address mismatch.
        Expected ${account.address}, got ${
        newAccount ? newAccount.address : null
      }`)
    }
  }

  toBigN(a) {
    return BigNumber(a)
  }
}
