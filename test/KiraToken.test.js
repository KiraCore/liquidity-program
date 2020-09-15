const Token = artifacts.require('KiraToken')

var chai = require('chai')
const BN = web3.utils.BN
const chaiBN = require('chai-bn')(BN)
chai.use(chaiBN)

var chaiAsPromised = require('chai-as-promised')
const { assert } = require('chai')
chai.use(chaiAsPromised)

const expect = chai.expect

contract('KiraToken Test', async (accounts) => {
  const [deployerAccount, recipient] = accounts

  it('all tokens should be in my account', async () => {
    let instance = await Token.deployed()
    let totalSupply = await instance.totalSupply()
    expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply)
  })

  it('should be freezed at first', async () => {
    let instance = await Token.deployed()
    const freezed = await instance.freezed()
    expect(freezed).to.equal(true)
  })

  // it('is possible to send tokens between accounts when paused', async () => {
  //   const sendTokens = 100
  //   let instance = await Token.deployed()
  //   let totalSupply = await instance.totalSupply()
  //   expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply)
  //   expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled
  //   expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply.sub(new BN(sendTokens)))
  //   expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(sendTokens))
  // })

  // it('is possible to send tokens between accounts when unpaused', async () => {
  //   const sendTokens = 100
  //   let instance = await Token.deployed()
  //   let totalSupply = await instance.totalSupply()
  //   await instance.unpause()
  //   expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply)
  //   expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled
  //   expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply.sub(new BN(sendTokens)))
  //   expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(sendTokens - (sendTokens * 4) / 100))
  //   expect(instance.rewardPool()).to.eventually.be.a.bignumber.equal(new BN((sendTokens * 2) / 100))
  // })

  // it('is not possible to send more tokens than available in total', async () => {
  //   let instance = await Token.deployed()
  //   let balanceOfDeployer = await instance.balanceOf(deployerAccount)

  //   expect(instance.transfer(recipient, new BN(balanceOfDeployer + 1))).to.eventually.be.rejected

  //   expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber(balanceOfDeployer)
  // })
})
