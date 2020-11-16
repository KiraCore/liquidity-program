const KiraAuction = artifacts.require('KiraAuction')
const KiraToken = artifacts.require('KiraToken')

var chai = require('chai')
const BN = web3.utils.BN
const chaiBN = require('chai-bn')(BN)
chai.use(chaiBN)

var chaiAsPromised = require('chai-as-promised')
const { assert } = require('chai')
chai.use(chaiAsPromised)

const expect = chai.expect

const toWei = (amount) => web3.utils.toWei(amount.toString(), "ether")

contract('KiraAuction Test', async function (accounts) {
  const [deployerAccount, account1, account2] = accounts
  let instance, token, tokenDecimals

  const doWaitSeconds = (sec) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, sec * 1000)
    })
  }

  const doDeploy = async function () {
    token = await KiraToken.new()
    instance = await KiraAuction.new(token.address)
    tokenDecimals = await token.decimals()
  }

  const getCurrentTimestamp = function () {
    return Math.floor(new Date().getTime() / 1000)
  }

  const doConfigAuction = async function (_deltaStartTime = 2, _p1 = 3, _p2 = 1, _p3 = 0, _t1 = 5, _t2 = 20, _txIntervalLimit = 1, _txMinWeiAmount = 0.01, _txMaxWeiAmount = 10) {
    await instance.configAuction(getCurrentTimestamp() + _deltaStartTime, toWei(_p1), toWei(_p2), toWei(_p3), _t1, _t2, _txIntervalLimit, toWei(_txMinWeiAmount), toWei(_txMaxWeiAmount))
  }

  const setupAuctionLiquidity = async function (amount) {
    await token.transfer(instance.address, new BN(amount * (10 ** tokenDecimals)))
  }

  describe('KiraAuction', function () {
    /*
      - [x] KiraToken should be configured once deployed
      - [x] wallet should be the owner once deployed
    */
    before(doDeploy);

    it('KiraToken should be configured once deployed', async function () {
      await expect(instance.getTokenContractAddress()).to.eventually.equal(token.address)
    })
    it('wallet should be the owner once deployed', async function () {
      await expect(instance.wallet()).to.eventually.equal(deployerAccount)
    })
  })

  describe('configAuction', function () {
    /*
      - [x] should only be callable by the owner
      - [x] should only be callable before auction starts
      - [x] can't set set the startTime as old time
      - [x] should set the auction price as decreasing
      - [x] first slope's decreasing rate should be bigger than the second one
      - [x] slope times should be valid
      - [x] max size per transaction should be valid
      - [x] should set the variables properly (should convert to the ether unit)
    */

    beforeEach(doDeploy)

    it('should only be callable by the owner', async function () {
      await expect(instance.configAuction(getCurrentTimestamp() + 2, toWei(3), toWei(1), toWei(0), 5, 20, 1, toWei(0.01), toWei(10), { from: account1 })).to.eventually.be.rejected
    })

    it('should only be callable before auction starts', async function () {
      await doConfigAuction(1)
      await doWaitSeconds(2)

      await expect(instance.configAuction(getCurrentTimestamp() + 2, toWei(3), toWei(1), toWei(0), 5, 20, 1, toWei(0.01), toWei(10))).to.eventually.be.rejectedWith('KiraAuction: should be before auction starts')
    })

    it("can't set set the startTime as old time", async function () {
      await expect(instance.configAuction(getCurrentTimestamp() - 2, toWei(3), toWei(1), toWei(0), 5, 20, 1, toWei(0.01), toWei(10))).to.eventually.be.rejectedWith('KiraAuction: start time should be greater than now')
    })

    it('should set the auction price as decreasing', async function () {
      await expect(instance.configAuction(getCurrentTimestamp() + 2, toWei(2), toWei(3), toWei(0), 5, 20, 1, toWei(0.01), toWei(10))).to.eventually.be.rejectedWith('KiraAuction: price should go decreasing.')
    })

    it("first slope's decreasing rate should be bigger than the second one", async function () {
      await expect(instance.configAuction(getCurrentTimestamp() + 2, toWei(3), toWei(1), toWei(0), 10, 5, 1, toWei(0.01), toWei(10))).to.eventually.be.rejectedWith('KiraAuction: the first slope should have faster decreasing rate')
    })

    it("slope times should be valid", async function () {
      await expect(instance.configAuction(getCurrentTimestamp() + 2, toWei(3), toWei(1), toWei(0), 0, 5, 1, toWei(0.01), toWei(10))).to.eventually.be.rejectedWith('KiraAuction: the period of each slope should be greater than zero.')
    })

    it("max size per transaction should be valid", async function () {
      await expect(instance.configAuction(getCurrentTimestamp() + 2, toWei(3), toWei(1), toWei(0), 5, 20, 1, toWei(0), toWei(0))).to.eventually.be.rejectedWith('KiraAuction: the maximum amount per tx should be valid')
    })

    it("should set the variables properly (should convert to the ether unit)", async function () {
      const timestamp = getCurrentTimestamp() + 2
      await expect(instance.configAuction(timestamp, toWei(3), toWei(1), toWei(0), 5, 20, 1, toWei(0.01), toWei(10))).to.eventually.be.fulfilled

      const info = await instance.getAuctionConfigInfo()
      const infoDetail = Object.keys(info).map(key => info[key].toString())
      assert.deepStrictEqual(infoDetail, [timestamp.toString(), toWei(3), toWei(1), toWei(0), "5", "20", "1", toWei(0.01), toWei(10)])
    })
  })

  describe('setWallet', function () {
    /*
      - [x] wallet should only be configurable by the owner
      - [x] wallet should only be configurable before auction starts
      - [x] wallet should be set properly
    */
    beforeEach(doDeploy)

    it('wallet should only be configurable by the owner', async function () {
      await expect(instance.setWallet(account1, { from: account1 })).to.eventually.be.rejected
    })

    it('wallet should only be configurable before auction starts', async function () {
      await doConfigAuction(2)
      await doWaitSeconds(3)

      await expect(instance.setWallet(account1)).to.eventually.be.rejectedWith('KiraAuction: should be before auction starts')
    })

    it('wallet should be set properly', async function () {
      await doConfigAuction(2)
      await doWaitSeconds(1)

      await expect(instance.setWallet(account1)).to.eventually.be.fulfilled
      await expect(instance.wallet()).to.eventually.equal(account1)
    })
  })

  describe('whitelist', function () {
    /*
      - [x] whitelist should only be called by the owner
      - [x] whitelist should only be called before auction starts
      - [x] whitelist should be set properly
    */
    beforeEach(doDeploy)

    it('whitelist should only be called by the owner', async function () {
      await expect(instance.whitelist([account1], true, { from: account1 })).to.eventually.be.rejected
    })

    it('whitelist should only be called before auction starts', async function () {
      await doConfigAuction(2)
      await doWaitSeconds(3)

      await expect(instance.whitelist([account1], false)).to.eventually.be.rejectedWith('KiraAuction: should be before auction starts')
    })

    it('wallet should be set properly', async function () {
      await expect(instance.whitelist([account1], true)).to.eventually.be.fulfilled
      await expect(instance.whitelisted(account1)).to.eventually.equal(true)
      await expect(instance.whitelist([account1], false)).to.eventually.be.fulfilled
      await expect(instance.whitelisted(account1)).to.eventually.equal(false)
    })
  })

  describe('deposit', function () {
    /*
      - [x] should be rejected before the auction
      - [x] should be rejected after the auction
      - [x] owner or address(0) should not be able to participate in the auction
      - [x] should be rejected from not whitelisted account
      - [x] amount should be greater than the MIN_WEI
      - [x] amount should not exceed the MAX_WEI
      - [x] should be rejected when it exceeds the tx rate limit
      - [x] should be rejected if it exceeds the hard cap
      - [x] should update the total deposited amount, latest price and user info properly
    */
    beforeEach(doDeploy)

    it('should be rejected before the auction', async function () {
      await expect(instance.send(toWei(0.1), { from: account1 })).to.eventually.be.rejectedWith('KiraAuction: start time is not configured yet. So not in progress')

      await doConfigAuction(2)
      await doWaitSeconds(1)
      await expect(instance.send(toWei(1), { from: account1 })).to.eventually.be.rejectedWith('KiraAuction: it is out of processing period')
    })

    it('should be rejected after the auction', async function () {
      await doConfigAuction(1, 3, 1, 0, 1, 2, 0, 0.01, 10)
      await doWaitSeconds(5)

      await expect(instance.send(toWei(1), { from: account1 })).to.eventually.be.rejectedWith('KiraAuction: it is out of processing period')
    })

    it('owner or address(0) should not be able to participate in the auction', async function () {
      await doConfigAuction(1)
      await doWaitSeconds(1)

      await expect(instance.send(toWei(1), { from: deployerAccount })).to.eventually.be.rejectedWith('KiraAuction: Not owner')
    })

    it('should be rejected from not whitelisted account', async function () {
      await doConfigAuction(1)
      await doWaitSeconds(1)

      await expect(instance.send(toWei(1), { from: account1 })).to.eventually.be.rejectedWith("KiraAuction: You're not whitelisted, wait a moment.")
    })

    it('amount should be greater than the MIN_WEI', async function () {
      await expect(instance.whitelist([account1], true)).to.eventually.be.fulfilled
      await doConfigAuction(1)
      await doWaitSeconds(1)

      await expect(instance.send(toWei(0.001), { from: account1 })).to.eventually.be.rejectedWith("KiraAuction: That is not enough.")
    })

    it('amount should not exceed the MAX_WEI', async function () {
      await expect(instance.whitelist([account1], true)).to.eventually.be.fulfilled
      await doConfigAuction(1)
      await doWaitSeconds(1)

      await expect(instance.send(toWei(11), { from: account1 })).to.eventually.be.rejectedWith("KiraAuction: That is too much.")
    })

    it('should be rejected when it exceeds the tx rate limit', async function () {
      await setupAuctionLiquidity(1000)
      await expect(instance.whitelist([account1], true)).to.eventually.be.fulfilled

      const txRateLimit = 2 // 2 seconds
      await doConfigAuction(1, 3, 1, 0, 5, 20, txRateLimit, 0.01, 10)
      await doWaitSeconds(1)

      await expect(instance.send(toWei(1), { from: account1 })).to.eventually.be.fulfilled
      await expect(instance.send(toWei(1), { from: account1 })).to.eventually.be.rejectedWith("KiraAuction: it exceeds the tx rate limit")
    })

    it('should be rejected if it exceeds the hard cap', async function () {
      await setupAuctionLiquidity(1)
      await expect(instance.whitelist([account1], true)).to.eventually.be.fulfilled

      await doConfigAuction(2, 3, 1, 0, 2, 3, 0, 0.01, 30)
      await doWaitSeconds(3)

      await expect(instance.send(toWei(2.5), { from: account1 })).to.eventually.be.rejectedWith("KiraAuction: Your contribution overflows the hard cap!")
    })

    it('should update the total deposited amount, latest price and user info properly', async function () {
      await setupAuctionLiquidity(10)
      await expect(instance.whitelist([account1], true)).to.eventually.be.fulfilled

      await doConfigAuction(2, 3, 1, 0, 2, 5, 0, 0.01, 30)
      await doWaitSeconds(5)

      const sendEth = toWei(0.5)
      await expect(instance.send(sendEth, { from: account1 })).to.eventually.be.fulfilled
      await expect(instance.totalDeposited()).to.eventually.be.a.bignumber.equal(new BN(sendEth))
      await expect(instance.latestPrice.call()).to.eventually.be.a.bignumber.equal(new BN(toWei(0.05)))
    })
  })

  describe('claimTokens', function () {
    /*
      - [x] should only be called after auction ends
      - [x] should be rejected if non-whitelisted user tries to claim
      - [x] should be rejected if whitelisted & non-deposited user tries to claim
      - [x] should transfer the proper amount of tokens to the claimer
      - [x] should not be able to claim after distribution
      - [x] should not be able to distribute after all claimed
      - [x] should distribute proper amount of tokens to contributors
    */
    beforeEach(doDeploy)

    it('should only be called after auction ends', async function () {
      await doConfigAuction(1, 3, 1, 0, 1, 2, 0, 0.01, 10)
      await doWaitSeconds(3)

      await expect(instance.claimTokens(), { from: account1 }).to.eventually.be.rejectedWith('KiraAuction: should be after auction ends')
    })

    it('should be rejected if non-whitelisted user tries to claim', async function () {
      await doConfigAuction(1, 3, 1, 0, 1, 2, 0, 0.01, 10)
      await doWaitSeconds(5)

      await expect(instance.claimTokens(), { from: account1 }).to.eventually.be.rejectedWith('KiraAuction: you did not contribute.')
    })

    it('should be rejected if whitelisted & non-deposited user tries to claim', async function () {
      await expect(instance.whitelist([account1], true)).to.eventually.be.fulfilled
      await doConfigAuction(1, 3, 1, 0, 1, 2, 0, 0.01, 10)
      await doWaitSeconds(5)

      await expect(instance.claimTokens(), { from: account1 }).to.eventually.be.rejectedWith('KiraAuction: you did not contribute.')
    })

    it('should transfer the proper amount of tokens to the claimer', async function () {
      await expect(token.whitelist([instance.address], false, false, false, true)).to.eventually.be.fulfilled
      await setupAuctionLiquidity(10)
      await expect(instance.whitelist([account1], true)).to.eventually.be.fulfilled

      await doConfigAuction(2, 3, 1, 0, 2, 5, 0, 0.01, 30)
      await doWaitSeconds(5)

      await expect(instance.send(toWei(5), { from: account1 })).to.eventually.be.fulfilled
      await doWaitSeconds(2)

      const info = await instance.getCustomerInfo(account1)

      assert.equal(info[0], true);
      assert.equal(parseInt(info[1]), toWei(5));

      await expect(instance.claimTokens({ from: account1 })).to.eventually.be.fulfilled

      await expect(token.balanceOf(account1)).to.eventually.be.a.bignumber.equal(new BN(10 * (10 ** tokenDecimals)))
    })

    it('should not be able to claim after distribution', async function () {
      await expect(token.whitelist([instance.address], false, false, false, true)).to.eventually.be.fulfilled
      await setupAuctionLiquidity(10)
      await expect(instance.whitelist([account1], true)).to.eventually.be.fulfilled

      await doConfigAuction(2, 3, 1, 0, 2, 5, 0, 0.01, 30)
      await doWaitSeconds(5)

      await expect(instance.send(toWei(5), { from: account1 })).to.eventually.be.fulfilled
      await doWaitSeconds(2)

      const info = await instance.getCustomerInfo(account1)

      assert.equal(info[0], true);
      assert.equal(parseInt(info[1]), toWei(5));

      await expect(instance.distribute()).to.eventually.be.fulfilled

      await expect(instance.claimTokens({ from: account1 })).to.eventually.be.rejectedWith('KiraAuction: we already sent to your wallet.')
    })

    it('should not be able to distribute after all claimed', async function () {
      await expect(token.whitelist([instance.address], false, false, false, true)).to.eventually.be.fulfilled
      await setupAuctionLiquidity(10)
      await expect(instance.whitelist([account1], true)).to.eventually.be.fulfilled

      await doConfigAuction(2, 3, 1, 0, 2, 5, 0, 0.01, 30)
      await doWaitSeconds(5)

      await expect(instance.send(toWei(5), { from: account1 })).to.eventually.be.fulfilled
      await doWaitSeconds(2)

      const info = await instance.getCustomerInfo(account1)

      assert.equal(info[0], true);
      assert.equal(parseInt(info[1]), toWei(5));

      await expect(instance.claimTokens({ from: account1 })).to.eventually.be.fulfilled

      await expect(instance.distribute()).to.eventually.be.rejectedWith('KiraAuction: nothing to distribute. already claimed or distributed all!')
    })

    it('should distribute proper amount of tokens to contributors', async function () {
      await expect(token.whitelist([instance.address], false, false, false, true)).to.eventually.be.fulfilled
      await setupAuctionLiquidity(10)
      await expect(instance.whitelist([account1], true)).to.eventually.be.fulfilled

      await doConfigAuction(2, 3, 1, 0, 2, 5, 0, 0.01, 30)
      await doWaitSeconds(5)

      await expect(instance.send(toWei(5), { from: account1 })).to.eventually.be.fulfilled
      await doWaitSeconds(2)

      const info = await instance.getCustomerInfo(account1)

      assert.equal(info[0], true);
      assert.equal(parseInt(info[1]), toWei(5));

      await expect(instance.distribute()).to.eventually.be.fulfilled

      await expect(token.balanceOf(account1)).to.eventually.be.a.bignumber.equal(new BN(10 * (10 ** tokenDecimals)))
    })
  })

  describe('withdrawFunds', function () {
    /*
      - [x] should only be called from the owner
      - [x] should only be called after auction ends
      - [x] should be rejected if there is no balance on the contract
      - [x] should withdraw ETH and KEX correctly
    */
    beforeEach(doDeploy)

    it('should only be called from the owner', async function () {
      await expect(instance.withdrawFunds({ from: account1 })).to.eventually.be.rejected
    })

    it('should only be called after auction ends', async function () {
      await doConfigAuction(1, 3, 1, 0, 1, 2, 0, 0.01, 10)
      await doWaitSeconds(3)

      await expect(instance.withdrawFunds()).to.eventually.be.rejectedWith('KiraAuction: should be after auction ends')
    })

    it('should be rejected if there is no balance on the contract', async function () {
      await doConfigAuction(1, 3, 1, 0, 1, 2, 0, 0.01, 10)
      await doWaitSeconds(5)

      await expect(instance.withdrawFunds()).to.eventually.be.rejectedWith('KiraAuction: nothing left to withdraw')
    })

    it('should withdraw ETH and KEX correctly', async function () {
      await expect(token.whitelist([instance.address], false, false, false, true)).to.eventually.be.fulfilled
      await setupAuctionLiquidity(10)
      await expect(instance.whitelist([account1], true)).to.eventually.be.fulfilled

      await doConfigAuction(2, 3, 2, 1, 2, 5, 0, 0.01, 30)
      await doWaitSeconds(5)

      await expect(instance.send(toWei(5), { from: account1 })).to.eventually.be.fulfilled
      await doWaitSeconds(5)

      const info = await instance.getCustomerInfo(account1)

      assert.equal(info[0], true);
      assert.equal(parseInt(info[1]), toWei(5));

      await expect(instance.distribute()).to.eventually.be.fulfilled

      const oldWalletEthBalance = await web3.eth.getBalance(deployerAccount)
      const oldWalletKexBalance = await token.balanceOf(deployerAccount)

      await expect(instance.withdrawFunds()).to.eventually.be.fulfilled

      await expect(token.balanceOf(account1)).to.eventually.be.a.bignumber.equal(new BN(5 * (10 ** tokenDecimals)))

      const newWalletEthBalance = await web3.eth.getBalance(deployerAccount)

      assert.isAtLeast(parseInt(newWalletEthBalance), parseInt(oldWalletEthBalance), 'ETH amount should be increased')
      await expect(token.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(oldWalletKexBalance.add(new BN(5 * (10 ** tokenDecimals))))
    })
  })
})
