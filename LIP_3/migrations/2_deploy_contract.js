const KiraAuction = artifacts.require("./KiraAuction.sol")

module.exports = function (deployer) {
  /**
   * add the desired token to the next line
   * @example
   * deployer.deploy(KiraAuction)
   */

  // deployer.deploy(KiraToken).then(function () {
  //   return deployer.deploy(KiraAuction, KiraToken.address)
  // })

  console.log('Kira Token Address: ', process.env.KIRA_TOKEN_ADDRESS)

  return deployer.deploy(KiraAuction, process.env.KIRA_TOKEN_ADDRESS)
}
