const Token = artifacts.require('KiraAuction')

var chai = require('chai')
const BN = web3.utils.BN
const chaiBN = require('chai-bn')(BN)
chai.use(chaiBN)

var chaiAsPromised = require('chai-as-promised')
const { assert } = require('chai')
chai.use(chaiAsPromised)

const expect = chai.expect

contract('KiraAuction Test', async function (accounts) {
  const [deployerAccount, recipient] = accounts


  describe('KiraToken', function () {
    /*
      - [ ] KiraToken should be configured once deployed
      - [ ] wallet should be owner once deployed
    */
    it('KiraToken should be configured once deployed', async function () {

    })
  })

  describe('setWallet', function () {
    /*
      - [ ] wallet should only be configurable by the owner
      - [ ] wallet should only be configurable before auction starts
      - [ ] wallet should be set properly
    */
  })

  describe('configAuction', function () {
    /*
      - [ ] should only be callable by the owner
      - [ ] should only be callable before auction starts
      - [ ] can't set set the startTime as old time
      - [ ] should set the auction price as decreasing
      - [ ] first slope's decreasing rate should be bigger than the second one
      - [ ] slope times should be valid
      - [ ] transaction rate limit per each account should be valid
      - [ ] max size per transaction should be valid
      - [ ] should set the variables properly (should convert to the ether unit)
    */
  })

  describe('whitelist', function () {
    /*
      - [ ] whitelist should only be called by the owner
      - [ ] whitelist should only be called before auction starts
      - [ ] whitelist should be set properly
    */
  })

  describe('deposit', function () {
    /*
      - [ ] should only be called during the auction
      - [ ] owner or address(0) should not be able to participate in the auction
      - [ ] amount should not exceed the MAX_WEI
      - [ ] should be rejected from not whitelisted account
      - [ ] should be rejected when it exceeds the tx rate limit
      - [ ] should be rejected if it exceeds the hard cap
      - [ ] should update the total deposited amount, latest price and user info properly
    */
  })

  describe('claimTokens', function () {
    /*
      - [ ] should only be called after auction ends
      - [ ] should be rejected if non-whitelisted user tries to claim
      - [ ] should be rejected if whitelisted & non-deposited user tries to claim
      - [ ] should transfer the proper amount of tokens to the claimer
    */
  })

  describe('withdrawFunds', function () {
    /*
      - [ ] should only be called from the owner
      - [ ] should only be called after auction ends
      - [ ] should be rejected if there is no balance on the contract
    */
  })
})
