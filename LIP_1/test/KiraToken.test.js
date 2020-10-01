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
    /*
      - [x] all tokens should be in the deployer account
    */
    it('all tokens should be in the deployer account', async function () {
      let instance = await Token.deployed()
      let totalSupply = await instance.totalSupply()
      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply)
    })
  })

  describe('freeze', function () {
    /*
      - [ ] should NOT be able to freeze when it was already freezed
      - [x] should be freezed and the transfer should be rejected immediately after deployed
    */
    it('should be freezed at first and the transfer should be rejected', async function () {
      let instance = await Token.deployed()
      const freezed = await instance.freezed()
      expect(freezed).to.equal(true)

      const sendTokens = 100
      await expect(instance.transfer(recipient, sendTokens)).to.eventually.be.rejected
    })
  })

  describe('unfreeze', function () {
    /*
      - [ ] should NOT be able to unfreeze when it was already unfreezed
      - [ ] should make the token as 'unfreeze' when it was freezed
      - [x] should transfer freely once unfreezed
    */
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

  describe('whitelist', async function (done) {
    /*
      - [ ] should NOT be able to configure whitelist of the owner
      - [ ] should NOT be able to configure whitelist of 0 address
      - [ ] should whitelist any options of multiple addresses
      - [ ] should whitelist again
    */
    it('should not be able to remove owner from whitelist', async function () {
      let instance = await Token.deployed()
      await expect(instance.whitelist([deployerAccount], false, false)).to.eventually.be.rejected
    })
  })

  describe('blacklist', async function (done) {
    /*
      - [ ] should NOT be able to add owner to the blocklist
      - [ ] should NOT be able to add 0x0 to the blocklist
      - [ ] should NOT be able to remove owner from the blocklist
      - [ ] should NOT be able to remove 0x0 from the blocklist
      - [ ] should add to blacklist
      - [ ] should remove to blacklist
    */
    it('should not be able to remove owner from whitelist', async function () {
      let instance = await Token.deployed()
      await expect(instance.whitelist([deployerAccount], false, false)).to.eventually.be.rejected
    })
  })

  describe('transfer when unfreezed', function () {
    /*
      - Before all: when the token is unfreezed
      - [ ] should NOT be able to transfer (from: blacklisted)
      - [ ] should NOT be able to transfer (to: blacklisted)
      - [ ] should transfer (from: blacklisted [no], to: blacklisted [no])
    */
  })

  describe('transfer when freezed', function () {
    /*
      - Before all: when the token is freezed
      - [ ] should NOT be able to transfer (from: blacklisted)
      - [ ] should NOT be able to transfer (to: blacklisted)
      - [ ] should NOT be able to transfer (from: allow_transfer [no], to: allow_deposit [yes])
      - [ ] should NOT be able to transfer (from: allow_transfer [yes], to: allow_deposit [no])
      - [ ] should transfer (from: allow_transfer [yes], to: allow_deposit [yes])
      - [ ] should transfer (from: allow_unconditional_transfer [yes], to: allow_deposit [no])
      - [ ] should transfer (from: allow_transfer [no], to: allow_unconditional_deposit [no])
    */
    it('should be able to transfer between whitelisted accounts even if the token is freezed', async function () {
      let instance = await Token.deployed()
      await expect(instance.freeze()).to.eventually.be.fulfilled

      const freezed = await instance.freezed()
      expect(freezed).to.equal(true)

      await expect(instance.whitelist([recipient], true, true)).to.eventually.be.fulfilled

      const sendTokens = 100
      const oldFromBalance = await instance.balanceOf(deployerAccount)
      const oldToBalance = await instance.balanceOf(recipient)
      await expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled
      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(oldFromBalance.sub(new BN(sendTokens)))
      await expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(oldToBalance.add(new BN(sendTokens)))
    })
  })
})
