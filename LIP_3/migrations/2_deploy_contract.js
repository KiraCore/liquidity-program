const KiraAuction = artifacts.require("./KiraAuction.sol")
const KiraToken = artifacts.require("./KiraToken.sol");

module.exports = function (deployer) {
  /**
   * add the desired token to the next line
   * @example
   * deployer.deploy(KiraAuction)
   */

  deployer.deploy(KiraToken).then(function () {
    return deployer.deploy(KiraAuction, KiraToken.address)
  })

}
