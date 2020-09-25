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
const { ADDR_UNISWAP, ADDR_WETH } = require('./constants')

UniswapV2Router02.setProvider(web3._provider)

const waitSeconds = (sec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, sec * 1000)
  })
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
      - Send 100,000,000 to the rewardPool and check.
      - Send 1,000 tokens to provider1 and check.
      - Add liquidity (ETH/KEX) to uniswap from provider1
        ETH: 0.1
        KEX: 1,000
      - Configure the pair token (ETH/KEX).
        X: 720000 * 10^8
        T: 1 (1hr)
        maxT: 1 (1hr)
      - Provider1 claims rewards and get 0
      - Check the lastClaimSnapshot for the provider1
      - Wait 30 seconds.
      - Provider1 claims rewards and get approximately 6,000 KEX tokens.
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

      // Send 100,000,000 to the rewardPool and check.
      let oldFromBalance = await instance.balanceOf(deployerAccount)
      let oldToBalance = await instance.balanceOf(rewardPool.address)
      let sendTokens = new BN(10000 * (10 ** 8))
      await expect(instance.transfer(rewardPool.address, sendTokens)).to.eventually.be.fulfilled
      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(oldFromBalance.sub(new BN(sendTokens)))
      await expect(instance.balanceOf(rewardPool.address)).to.eventually.be.a.bignumber.equal(oldToBalance.add(new BN(sendTokens)))

      // Send 1,000 tokens to provider1 and check.
      oldFromBalance = await instance.balanceOf(deployerAccount)
      oldToBalance = await instance.balanceOf(provider1)
      sendTokens = new BN(2000 * (10 ** 8))
      await expect(instance.transfer(provider1, sendTokens)).to.eventually.be.fulfilled
      await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(oldFromBalance.sub(new BN(sendTokens)))
      await expect(instance.balanceOf(provider1)).to.eventually.be.a.bignumber.equal(oldToBalance.add(new BN(sendTokens)))

      /*
        Add liquidity (ETH/KEX) to uniswap from provider1
          ETH: 0.1
          KEX: 1,000
      */

      const deadline = (new Date()).getTime() + 5 * 60
      let uniswapV2Router02Instance = await UniswapV2Router02.at(ADDR_UNISWAP)

      await instance.approve(uniswapV2Router02Instance.address, 1000 * (10 ** 8), { from: provider1, gas: 4000000 });
      await uniswapV2Router02Instance.addLiquidityETH(
        instance.address,
        1000 * (10 ** 8),
        500 * (10 ** 8),
        (0.1 * (10 ** 18)).toString(),
        deployerAccount,
        deadline,
        {
          from: provider1,
          gas: 4000000,
          value: 0.1 * (10 ** 18)
        }
      )

      /*
        Configure the pair token (ETH/KEX).
          X: 720000 * 10^8
          T: 1 (1hr)
          maxT: 1 (1hr)
      */

      await expect(instance.addPairToken(ADDR_WETH, 72000 * (10 ** 8), 1, 1)).to.eventually.be.fulfilled

      // Provider1 claims rewards and get 0
      await expect(instance.claimRewards({ from: provider1 })).to.eventually.be.fulfilled

      // Check the lastClaimSnapshot for the provider1

      // Wait 30 seconds.
      await waitSeconds(10)

      // Provider1 claims rewards and get approximately 6,000 KEX tokens.
      const oldBalance = await instance.balanceOf(provider1)
      await expect(instance.claimRewards({ from: provider1 })).to.eventually.be.fulfilled

      const newBalance = await instance.balanceOf(provider1)
      console.log('Old: ', oldBalance, 'newBlanace: ', newBalance)
    })
  })
})
