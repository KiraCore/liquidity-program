const Token = artifacts.require('KiraToken')

var chai = require('chai')
const BN = web3.utils.BN
const chaiBN = require('chai-bn')(BN)
chai.use(chaiBN)

var chaiAsPromised = require('chai-as-promised')
const { assert } = require('chai')
chai.use(chaiAsPromised)

const expect = chai.expect

contract('KiraToken Test', async function (accounts) {
  const [deployerAccount, recipient] = accounts

  describe('totalSupply', function () {
    it('all tokens should be in my account', async function () {
      let instance = await Token.deployed()
      let totalSupply = await instance.totalSupply()
      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply)
    })
  })

  describe('freeze', function () {
    it('should be freezed at first and the transfer should be rejected', async function () {
      let instance = await Token.deployed()
      const freezed = await instance.freezed()
      expect(freezed).to.equal(true)

      const sendTokens = 100
      await expect(instance.transfer(recipient, sendTokens)).to.eventually.be.rejected
    })
  })

  describe('unfreeze', function () {
    it('should be able to transfer freely once unfreezed', async function () {
      let instance = await Token.deployed()
      await expect(instance.unfreeze()).to.eventually.be.fulfilled

      const freezed = await instance.freezed()
      expect(freezed).to.equal(false)

      const sendTokens = 100
      const oldFromBalance = await instance.balanceOf(deployerAccount)
      const oldToBalance = await instance.balanceOf(recipient)
      await expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled
      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(oldFromBalance.sub(new BN(sendTokens)))
      await expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(oldToBalance.add(new BN(sendTokens)))
    })
  })

  describe('whitelist', function () {
    it('should be able to transfer between whitelisted accounts even if the token is freezed', async function () {
      let instance = await Token.deployed()
      await expect(instance.freeze()).to.eventually.be.fulfilled

      const freezed = await instance.freezed()
      expect(freezed).to.equal(true)

      await expect(instance.whitelistAdd(recipient)).to.eventually.be.fulfilled

      const sendTokens = 100
      const oldFromBalance = await instance.balanceOf(deployerAccount)
      const oldToBalance = await instance.balanceOf(recipient)
      await expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled
      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(oldFromBalance.sub(new BN(sendTokens)))
      await expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(oldToBalance.add(new BN(sendTokens)))
    })
  })

  describe('whitelistRemove', async function (done) {
    it('should not be able to remove owner from whitelist', async function () {
      let instance = await Token.deployed()
      await expect(instance.whitelistRemove(deployerAccount)).to.eventually.be.rejected
    })
  })
})
