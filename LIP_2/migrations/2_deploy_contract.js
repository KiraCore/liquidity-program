const KiraStaking = artifacts.require("./KiraStaking.sol")

module.exports = async function (deployer, network, accounts) {
  /**
   * add the desired token to the next line
   * @example
   * deployer.deploy(KiraStaking)
   */

  const owner = process.env.OWNER_ADDRESS
  const rewardsToken = process.env.KIRA_TOKEN_ADDRESS
  const stakingToken = process.env.STAKING_TOKEN_ADDRESS
  await deployer.deploy(KiraStaking, owner, rewardsToken, stakingToken)
}
