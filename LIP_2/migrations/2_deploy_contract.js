const KiraDrop = artifacts.require("./KiraDrop.sol")
const KiraRewardPool = artifacts.require("./KiraRewardPool.sol")
const contract = require('@truffle/contract');
// const ERC20 = contract(require('@uniswap/v2-periphery/build/ERC20.json'))
// const UniswapV2Factory = contract(require('@uniswap/v2-core/build/UniswapV2Factory.json'))
// const UniswapV2Router02 = contract(require('@uniswap/v2-periphery/build/UniswapV2Router02.json'));

// ERC20.setProvider(this.web3._provider)
// UniswapV2Factory.setProvider(this.web3._provider)
// UniswapV2Router02.setProvider(this.web3._provider)


module.exports = async function (deployer, network, accounts) {
  /**
   * add the desired token to the next line
   * @example
   * deployer.deploy(KiraDrop)
   */

  await deployer.deploy(KiraDrop)
  await deployer.deploy(KiraRewardPool)
  // const weth = await deployer.deploy(ERC20, "10000000000000000000", { from: accounts[0] })
  // const factory = await deployer.deploy(UniswapV2Factory, accounts[0], { from: accounts[0] })
  // const router = await deployer.deploy(UniswapV2Router02, factory.address, weth.address, { from: accounts[0] })
  // console.log(router.address)
}
