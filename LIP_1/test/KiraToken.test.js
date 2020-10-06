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
  const [deployerAccount, account1, account2] = accounts

  let instance

  before(async function () {
    instance = await Token.deployed()
  })

  async function makeFreeze() {
    const freezed = await instance.freezed()
    if (!freezed) {
      await instance.freeze()
    }
  }

  async function makeUnfreeze() {
    const freezed = await instance.freezed()
    if (freezed) {
      await instance.unfreeze()
    }
  }

  async function clearWhitelistBlacklist() {
    await instance.whitelist([account1, account2], true, true, true, true)
    await instance.removeFromBlacklist([account1, account2])
  }

  describe('totalSupply', function () {
    /*
      - [x] all tokens should be in the deployer account
    */
    it('all tokens should be in the deployer account', async function () {
      let totalSupply = await instance.totalSupply()
      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply)
    })
  })

  describe('freeze', function () {
    /*
      - [x] should be freezed and the transfer should be rejected after deployed
      - [x] should NOT be able to freeze when it was already freezed
      - [x] should reject freeze call from non owner
      - [x] should make the token as 'freeze' when it was unfreezed
    */
    it('should be freezed at first and the transfer should be rejected', async function () {
      await expect(instance.freezed()).to.eventually.equal(true)
      await expect(instance.transfer(account1, 100, { from: account2 })).to.eventually.be.rejected
    })
    it('should NOT be able to freeze when it was already freezed', async function () {
      await makeFreeze()
      expect(instance.freeze()).to.eventually.be.rejected
    })
    it('should reject freeze call from non owner', async function () {
      expect(instance.freeze({ from: account1 })).to.eventually.be.rejected
    })
    it('should make the token as freeze when it was unfreezed', async function () {
      await makeUnfreeze()
      await expect(instance.freeze()).to.eventually.be.fulfilled
      await expect(instance.freezed()).to.eventually.equal(true)
    })
  })

  describe('unfreeze', function () {
    /*
      - [x] should NOT be able to unfreeze when it was already unfreezed
      - [x] should reject unfreeze call from non owner
      - [x] should make the token as 'unfreeze' when it was freezed
      - [x] should transfer freely once unfreezed
    */
    it('should NOT be able to unfreeze when it was already unfreezed', async function () {
      await makeUnfreeze()
      expect(instance.unfreeze()).to.eventually.be.rejected
    })
    it('should reject unfreeze call from non owner', async function () {
      expect(instance.unfreeze({ from: account1 })).to.eventually.be.rejected
    })
    it('should make the token as unfreeze when it was freezed', async function () {
      await makeFreeze()
      await expect(instance.unfreeze()).to.eventually.be.fulfilled
      await expect(instance.freezed()).to.eventually.equal(false)
    })
    it('should be able to transfer freely once unfreezed', async function () {
      await makeUnfreeze()

      const sendTokens = 100
      const oldFromBalance = await instance.balanceOf(deployerAccount)
      const oldToBalance = await instance.balanceOf(account1)
      await expect(instance.transfer(account1, sendTokens)).to.eventually.be.fulfilled
      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(oldFromBalance.sub(new BN(sendTokens)))
      await expect(instance.balanceOf(account1)).to.eventually.be.a.bignumber.equal(oldToBalance.add(new BN(sendTokens)))
    })
  })

  describe('whitelist', async function (done) {
    /*
      - [x] onwer should have full whitelist
      - [x] should NOT be able to configure whitelist of 0 address
      - [x] should NOT be able to configure whitelist without owner permission
      - [x] should whitelist any options of multiple addresses
    */
    beforeEach(async function () {
      await clearWhitelistBlacklist()
    })
    it('onwer should have full whitelist', async function () {
      await expect(instance.whitelisted(deployerAccount)).to.eventually.deep.equal({ 0: true, 1: true, 2: true, 3: true })
    })
    it('should NOT be able to configure whitelist of 0 address', async function () {
      await expect(instance.whitelist([account1, 0], false, false, false, false)).to.eventually.be.rejected
    })
    it('should NOT be able to configure whitelist without owner permission', async function () {
      await expect(instance.whitelist([account1], false, false, false, false, { from: account1 })).to.eventually.be.rejected
    })
    it('should whitelist any options of multiple addresses', async function () {
      await expect(instance.whitelist([account1, account2], true, true, true, true)).to.eventually.be.fulfilled
      await expect(instance.whitelisted(account1)).to.eventually.deep.equal({ 0: true, 1: true, 2: true, 3: true })
      await expect(instance.whitelisted(account2)).to.eventually.deep.equal({ 0: true, 1: true, 2: true, 3: true })
    })
  })

  describe('blacklist', async function (done) {
    /*
      - [x] should NOT be able to add 0x0 to the blacklist
      - [x] should NOT be able to remove 0x0 from the blacklist
      - [x] should NOT be able to add/remove blacklist without owner permission
      - [x] should add to blacklist
      - [x] should remove from blacklist
    */
    beforeEach(async function () {
      await clearWhitelistBlacklist()
    })

    it('should NOT be able to add 0x0 to the blacklist', async function () {
      await expect(instance.addToBlacklist([account1, 0])).to.eventually.be.rejected
    })
    it('should NOT be able to remove 0x0 from the blacklist', async function () {
      await expect(instance.removeFromBlacklist([account1, 0])).to.eventually.be.rejected
    })
    it('should NOT be able to add/remove blacklist without owner permission', async function () {
      await expect(instance.addToBlacklist([account1], { from: account1 })).to.eventually.be.rejected
      await expect(instance.removeFromBlacklist([account1], { from: account1 })).to.eventually.be.rejected
    })
    it('should add to blacklist', async function () {
      await expect(instance.addToBlacklist([account1, account2])).to.eventually.be.fulfilled
      await expect(instance.blacklisted(account1)).to.eventually.equal(true)
      await expect(instance.blacklisted(account2)).to.eventually.equal(true)
    })
    it('should remove from blacklist', async function () {
      await expect(instance.removeFromBlacklist([account1, account2])).to.eventually.be.fulfilled
      await expect(instance.blacklisted(account1)).to.eventually.equal(false)
      await expect(instance.blacklisted(account2)).to.eventually.equal(false)
    })
  })

  describe('transfer when unfreezed', function () {
    /*
      - Before all: make token unfreezed
      - [x] should NOT be able to transfer (from: blacklisted)
      - [x] should NOT be able to transfer (to: blacklisted)
      - [x] should transfer (from: blacklisted [no], to: blacklisted [no])
    */

    before(async function () {
      await makeUnfreeze()
      await clearWhitelistBlacklist()
    })

    it('should NOT be able to transfer (from: blacklisted)', async function () {
      // send some funds to account1
      await expect(instance.transfer(account1, 1000)).to.eventually.be.fulfilled

      // make account1 as blacklisted
      await expect(instance.addToBlacklist([account1])).to.eventually.be.fulfilled
      await expect(instance.transfer(deployerAccount, 100, { from: account1 })).to.eventually.be.rejectedWith('KEX: sender is blacklisted')
    })

    it('should NOT be able to transfer (to: blacklisted)', async function () {
      // make account1 as blacklisted
      await expect(instance.addToBlacklist([account1])).to.eventually.be.fulfilled
      await expect(instance.transfer(account1, 100)).to.eventually.be.rejectedWith('KEX: receiver is blacklisted')
    })

    it('should transfer (from: blacklisted [no], to: blacklisted [no])', async function () {
      await expect(instance.removeFromBlacklist([account1])).to.eventually.be.fulfilled
      await expect(instance.transfer(account2, 100, { from: account1 })).to.eventually.be.fulfilled
    })
  })

  describe('transfer when freezed', function () {
    /*
      - Before all: make the token freezed
      - [x] should NOT be able to transfer (from: blacklisted) even if its allow_transfer is true
      - [x] should NOT be able to transfer (to: blacklisted) even if its allow_deposit is true
      - [x] should NOT be able to transfer (from: allow_transfer [no], to: allow_deposit [yes])
      - [x] should NOT be able to transfer (from: allow_transfer [yes], to: allow_deposit [no])
      - [x] should transfer (from: allow_transfer [yes], to: allow_deposit [yes])
      - [x] should transfer (from: allow_unconditional_transfer [yes], to: allow_deposit [no])
      - [x] should transfer (from: allow_transfer [no], to: allow_unconditional_deposit [yes])
    */
    before(async function () {
      await makeFreeze()
      await instance.transfer(account1, 1000)
      await instance.transfer(account2, 1000)
    })

    beforeEach(async function () {
      await clearWhitelistBlacklist()
    })

    it('should NOT be able to transfer (from: blacklisted) even if its allow_transfer is true', async function () {
      // account1 -> account2
      await expect(instance.addToBlacklist([account1])).to.eventually.be.fulfilled
      await expect(instance.whitelist([account1], false, true, false, false)).to.eventually.be.fulfilled
      await expect(instance.whitelist([account2], true, false, false, false)).to.eventually.be.fulfilled
      await expect(instance.transfer(account2, 100, { from: account1 })).to.eventually.be.rejectedWith('KEX: sender is blacklisted')
    })
    it('should NOT be able to transfer (to: blacklisted) even if its allow_deposit is true', async function () {
      // account1 -> account2
      await expect(instance.addToBlacklist([account2])).to.eventually.be.fulfilled
      await expect(instance.whitelist([account2], false, true, false, false)).to.eventually.be.fulfilled
      await expect(instance.whitelist([account1], true, false, false, false)).to.eventually.be.fulfilled
      await expect(instance.transfer(account2, 100, { from: account1 })).to.eventually.be.rejectedWith('KEX: receiver is blacklisted')
    })
    it('should NOT be able to transfer (from: allow_transfer [no], to: allow_deposit [yes])', async function () {
      // account1 -> account2
      await expect(instance.whitelist([account1], true, false, false, false)).to.eventually.be.fulfilled
      await expect(instance.whitelist([account2], true, false, false, false)).to.eventually.be.fulfilled
      await expect(instance.transfer(account2, 100, { from: account1 })).to.eventually.be.rejectedWith('KEX: token transfer while freezed and not whitelisted.')
    })
    it('should NOT be able to transfer (from: allow_transfer [yes], to: allow_deposit [no])', async function () {
      // account1 -> account2
      await expect(instance.whitelist([account1], false, true, false, false)).to.eventually.be.fulfilled
      await expect(instance.whitelist([account2], false, true, false, false)).to.eventually.be.fulfilled
      await expect(instance.transfer(account2, 100, { from: account1 })).to.eventually.be.rejectedWith('KEX: token transfer while freezed and not whitelisted.')
    })
    it('should transfer (from: allow_transfer [yes], to: allow_deposit [yes])', async function () {
      // account1 -> account2
      await expect(instance.whitelist([account1], false, true, false, false)).to.eventually.be.fulfilled
      await expect(instance.whitelist([account2], true, true, false, false)).to.eventually.be.fulfilled
      await expect(instance.transfer(account2, 100, { from: account1 })).to.eventually.be.fulfilled
    })
    it('should transfer (from: allow_unconditional_transfer [yes], to: allow_deposit [no])', async function () {
      // account1 -> account2
      await expect(instance.whitelist([account1], false, false, false, true)).to.eventually.be.fulfilled
      await expect(instance.whitelist([account2], false, false, false, false)).to.eventually.be.fulfilled
      await expect(instance.transfer(account2, 100, { from: account1 })).to.eventually.be.fulfilled
    })
    it('should transfer (from: allow_transfer [no], to: allow_unconditional_deposit [yes])', async function () {
      // account1 -> account2
      await expect(instance.whitelist([account1], false, false, false, false)).to.eventually.be.fulfilled
      await expect(instance.whitelist([account2], false, false, true, false)).to.eventually.be.fulfilled

      const sendTokens = 100
      const oldFromBalance = await instance.balanceOf(account1)
      const oldToBalance = await instance.balanceOf(account2)
      await expect(instance.transfer(account2, sendTokens, { from: account1 })).to.eventually.be.fulfilled
      await expect(instance.balanceOf(account1)).to.eventually.be.a.bignumber.equal(oldFromBalance.sub(new BN(sendTokens)))
      await expect(instance.balanceOf(account2)).to.eventually.be.a.bignumber.equal(oldToBalance.add(new BN(sendTokens)))
    })
  })

  describe('multi transfer', function () {
    /*
      - Before all: make the token unfreezed
      - [x] should be able to transfer to multiple accounts
    */

    before(async function () {
      await makeUnfreeze()
    })

    it('should be able to transfer to multiple accounts', async function () {
      // deployer -> account1, account2

      const sendTokens = 100
      const oldFromBalance = await instance.balanceOf(deployerAccount)
      const oldToBalance1 = await instance.balanceOf(account1)
      const oldToBalance2 = await instance.balanceOf(account2)
      await expect(instance.multiTransfer([account1, account2], sendTokens)).to.eventually.be.fulfilled

      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(oldFromBalance.sub(new BN(sendTokens * 2)))
      await expect(instance.balanceOf(account1)).to.eventually.be.a.bignumber.equal(oldToBalance1.add(new BN(sendTokens)))
      await expect(instance.balanceOf(account2)).to.eventually.be.a.bignumber.equal(oldToBalance2.add(new BN(sendTokens)))
    })
  })
})
