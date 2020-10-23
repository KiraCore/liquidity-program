const KiraAuction = artifacts.require("./KiraAuction.sol")
const KiraToken = artifacts.require("./KiraToken.sol")

module.exports = function (deployer, network) {
  /**
   * add the desired token to the next line
   * @example
   * deployer.deploy(KiraAuction)
   */

  console.log('Network: ', network)
  console.log('Predefined Address: ', process.env.KIRA_TOKEN_ADDRESS)

  if (network === "development") {
    // this is only for testing
    deployer.deploy(KiraToken).then(function () {
      return deployer.deploy(KiraAuction, KiraToken.address)
    })
  } else {
    deployer.deploy(KiraAuction, process.env.KIRA_TOKEN_ADDRESS)
  }

}
