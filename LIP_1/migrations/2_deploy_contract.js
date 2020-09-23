const KiraToken = artifacts.require("./KiraToken.sol")

module.exports = function (deployer) {
  /**
   * add the desired token to the next line
   * @example
   * deployer.deploy(KiraToken)
   */

  deployer.deploy(KiraToken)
}
