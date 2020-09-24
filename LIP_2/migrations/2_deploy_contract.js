const KiraDrop = artifacts.require("./KiraDrop.sol")

module.exports = function (deployer) {
  /**
   * add the desired token to the next line
   * @example
   * deployer.deploy(KiraDrop)
   */

  deployer.deploy(KiraDrop)
}
