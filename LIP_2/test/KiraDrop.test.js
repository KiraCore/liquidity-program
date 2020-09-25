const KiraDrop = artifacts.require('KiraDrop')
const KiraRewardPool = artifacts.require('KiraRewardPool')

const truffleContract = require('@truffle/contract');
const UniswapV2Router02 = truffleContract(require('@uniswap/v2-periphery/build/UniswapV2Router02.json'));

var chai = require('chai')
const BN = web3.utils.BN
const chaiBN = require('chai-bn')(BN)
chai.use(chaiBN)

var chaiAsPromised = require('chai-as-promised')
const { assert } = require('chai')
chai.use(chaiAsPromised)

const expect = chai.expect
const { ADDR_UNISWAP, ADDR_WETH, KEX_DECIMAL } = require('./constants')

UniswapV2Router02.setProvider(web3._provider)

const waitSeconds = (sec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, sec * 1000)
  })
}

const toKex = (count) => {
  return count * (10 ** KEX_DECIMAL)
}

const fromKex = (count) => {
  return parseInt(count.toString()) / (10 ** KEX_DECIMAL)
}

const afterMinutes = (minute) => {
  return (new Date()).getTime() + minute * 60
}

const displayLastSnapshot = (snapshot) => {
  console.log('------------------------Snapshoot------------------------')
  console.log(`user's liquidity: `, snapshot[1].toString())
  console.log('total liquidity: ', snapshot[2].toString())
  console.log('---------------------------------------------------------')
}

const utils = {
  toKex,
  fromKex,
  afterMinutes,
  displayLastSnapshot
}

contract('KiraDrop Test', async function (accounts) {
  const [deployerAccount, provider1, provider2] = accounts

  describe('totalSupply', function () {
    it('all tokens should be in my account', async function () {
      let instance = await KiraDrop.deployed()
      let totalSupply = await instance.totalSupply()
      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply)
    })
  })

  /*
    Testing Scenario
      - KiraDrop TotalSupply should be 300,000,000
      - Set Reward Pool Address (KiraRewardPool) and check.
      - Send 2,000,000 to the rewardPool and check.
      - Send 1,000 tokens to provider1 and check.
      - Add liquidity (ETH/KEX) to uniswap from provider1
        ETH: 0.1
        KEX: 1,000
      - Configure the pair token (ETH/KEX).
        X: 720000 * 10^8
        T: 1 (1hr)
        maxT: 1 (1hr)
      - Provider1 claims rewards and get 0
      - Check the lastClaimByUser for the provider1
      - Wait 10 seconds.
      - Provider1 claims rewards and get 200 KEX tokens.
  */

  describe('claimReward', async function () {
    it('should give correct rewards to a liquidity provider according to the proportion of LP tokens', async function () {
      let instance = await KiraDrop.deployed()
      let rewardPool = await KiraRewardPool.deployed()

      // Set Reward Pool Address (KiraRewardPool) and check.
      let totalSupply = await instance.totalSupply()
      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply)
      await expect(instance.setRewardPool(rewardPool.address)).to.eventually.be.fulfilled
      await expect(instance.rewardPool()).to.eventually.be.equal(rewardPool.address)

      // Send 2,000,000 to the rewardPool and check.
      let oldFromBalance = await instance.balanceOf(deployerAccount)
      let oldToBalance = await instance.balanceOf(rewardPool.address)
      let sendTokens = utils.toKex(2 * 10 ** 6)
      await expect(instance.transfer(rewardPool.address, sendTokens)).to.eventually.be.fulfilled
      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(oldFromBalance.sub(new BN(sendTokens)))
      await expect(instance.balanceOf(rewardPool.address)).to.eventually.be.a.bignumber.equal(oldToBalance.add(new BN(sendTokens)))

      // Send 2,000 tokens to provider1 and check.
      oldFromBalance = await instance.balanceOf(deployerAccount)
      oldToBalance = await instance.balanceOf(provider1)
      sendTokens = utils.toKex(2000)
      await expect(instance.transfer(provider1, sendTokens)).to.eventually.be.fulfilled
      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(oldFromBalance.sub(new BN(sendTokens)))
      await expect(instance.balanceOf(provider1)).to.eventually.be.a.bignumber.equal(oldToBalance.add(new BN(sendTokens)))

      /*
        Add liquidity (ETH/KEX) to uniswap from provider1
          ETH: 0.1
          KEX: 1,000
      */

      const deadline = utils.afterMinutes(5)
      let uniswapV2Router02Instance = await UniswapV2Router02.at(ADDR_UNISWAP)

      await instance.approve(uniswapV2Router02Instance.address, toKex(1000), { from: provider1, gas: 4000000 });
      await uniswapV2Router02Instance.addLiquidityETH(
        instance.address,
        toKex(1000),  // amountTokenDesired
        toKex(500), // amountTokenMin
        (0.1 * (10 ** 18)).toString(), // amountETHMin
        provider1,
        deadline,
        {
          from: provider1,
          gas: 4000000,
          value: 0.1 * (10 ** 18)
        }
      )

      // /*
      //   Configure the pair token (ETH/KEX).
      //     X: 720000 * 10^8
      //     T: 1 (1hr)
      //     maxT: 1 (1hr)
      // */

      await expect(instance.addPairToken(ADDR_WETH, utils.toKex(720000), 1, 1)).to.eventually.be.fulfilled
      await expect(instance.getTotalPairs()).to.eventually.be.a.bignumber.equal(new BN(1)) // check if there is only one pair

      // // Provider1 claims rewards and get 0
      let oldBalance = await instance.balanceOf(provider1)
      await expect(instance.claimRewards({ from: provider1 })).to.eventually.be.fulfilled
      let newBalance = await instance.balanceOf(provider1)
      expect(oldBalance.toString()).equal(newBalance.toString())

      // // Check the lastClaimByUser for the provider1
      const snapshot = await instance.getLastSnapshotByUser(provider1, ADDR_WETH)
      utils.displayLastSnapshot(snapshot)

      // // Wait 10 seconds.
      await waitSeconds(10)

      // // Provider1 claims rewards and get approximately 2,000 KEX tokens.
      oldBalance = await instance.balanceOf(provider1)
      await expect(instance.claimRewards({ from: provider1 })).to.eventually.be.fulfilled
      newBalance = await instance.balanceOf(provider1)

      console.log('Old: ', oldBalance.toNumber(), 'newBlanace: ', newBalance.toNumber())
    })
  })
})
