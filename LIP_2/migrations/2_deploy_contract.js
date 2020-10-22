const KiraStaking = artifacts.require("./KiraStaking.sol")
const KiraToken = artifacts.require("./KiraToken.sol")

module.exports = async function (deployer, network, accounts) {
  /**
   * add the desired token to the next line
   * @example
   * deployer.deploy(KiraStaking)
   */

  // await deployer.deploy(KiraToken)

  const owner = "0x21A2CF2b1E84d9E9a38389F797F6087d94Ed3d86"
  const rewardsToken = "0x41379EF961492a594F91bB0F966c2CeD32B49544"
  const stakingToken = "0xb88B44F171d6fC4EF6eFcE313819067E62002D5c"
  await deployer.deploy(KiraStaking, owner, rewardsToken, stakingToken)
}
