const KiraAuction = artifacts.require("./KiraAuction.sol")

module.exports = function (deployer) {
  /**
   * add the desired token to the next line
   * @example
   * deployer.deploy(KiraAuction)
   */

  deployer.deploy(KiraAuction)
}
