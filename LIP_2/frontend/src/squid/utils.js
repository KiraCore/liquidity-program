import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const GAS_LIMIT = {
  STAKING: {
    DEFAULT: 200000,
    SNX: 850000,
  },
}

export const getSquidChefAddress = (squid) => {
  return squid && squid.squidChefAddress
}
export const getSquidAddress = (squid) => {
  return squid && squid.squidAddress
}
export const getWethContract = (squid) => {
  return squid && squid.contracts && squid.contracts.weth
}

export const getSquidChefContract = (squid) => {
  return squid && squid.contracts && squid.contracts.squidChef
}
export const getSquidContract = (squid) => {
  return squid && squid.contracts && squid.contracts.squid
}

export const getXSquidStakingContract = (squid) => {
  return squid && squid.contracts && squid.contracts.xSquidStaking
}

export const getFarms = (squid) => {
  return squid
    ? squid.contracts.pools.map(
        ({
          pid,
          name,
          symbol,
          icon,
          tokenAddress,
          tokenSymbol,
          tokenContract,
          lpAddress,
          lpContract,
        }) => ({
          pid,
          id: symbol,
          name,
          lpToken: symbol,
          lpTokenAddress: lpAddress,
          lpContract,
          tokenAddress,
          tokenSymbol,
          tokenContract,
          earnToken: 'squid',
          earnTokenAddress: squid.contracts.squid.options.address,
          icon,
        }),
      )
    : []
}

export const getPoolWeight = async (squidChefContract, pid) => {
  const { allocPoint } = await squidChefContract.methods.poolInfo(pid).call()
  const totalAllocPoint = await squidChefContract.methods
    .totalAllocPoint()
    .call()
  return new BigNumber(allocPoint).div(new BigNumber(totalAllocPoint))
}

export const getEarned = async (squidChefContract, pid, account) => {
  return squidChefContract.methods.pendingSquid(pid, account).call()
}

export const getTotalLPWethValue = async (
  squidChefContract,
  wethContract,
  lpContract,
  tokenContract,
  pid,
) => {
  console.log(lpContract.options.address)
  // Get balance of the token address
  const tokenAmountWholeLP = await tokenContract.methods
    .balanceOf(lpContract.options.address)
    .call()
  const tokenDecimals = await tokenContract.methods.decimals().call()
  // Get the share of lpContract that squidChefContract owns
  const balance = await lpContract.methods
    .balanceOf(squidChefContract.options.address)
    .call()
  // Convert that into the portion of total lpContract = p1
  const totalSupply = await lpContract.methods.totalSupply().call()
  // Get total weth value for the lpContract = w1
  const lpContractWeth = await wethContract.methods
    .balanceOf(lpContract.options.address)
    .call()
  // Return p1 * w1 * 2
  const portionLp = new BigNumber(balance).div(new BigNumber(totalSupply))
  const lpWethWorth = new BigNumber(lpContractWeth)
  const totalLpWethValue = portionLp.times(lpWethWorth).times(new BigNumber(2))
  // Calculate
  const tokenAmount = new BigNumber(tokenAmountWholeLP)
    .times(portionLp)
    .div(new BigNumber(10).pow(tokenDecimals))

  const wethAmount = new BigNumber(lpContractWeth)
    .times(portionLp)
    .div(new BigNumber(10).pow(18))
  return {
    tokenAmount,
    wethAmount,
    totalWethValue: totalLpWethValue.div(new BigNumber(10).pow(18)),
    tokenPriceInWeth: wethAmount.div(tokenAmount),
    poolWeight: await getPoolWeight(squidChefContract, pid),
  }
}

export const approve = async (lpContract, squidChefContract, account) => {
  return lpContract.methods
    .approve(squidChefContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account })
}

export const approveAddress = async (lpContract, address, account) => {
  return lpContract.methods
      .approve(address, ethers.constants.MaxUint256)
      .send({ from: account })
}

export const getSquidSupply = async (squid) => {
  return new BigNumber(await squid.contracts.squid.methods.totalSupply().call())
}

export const getXSquidSupply = async (squid) => {
  return new BigNumber(await squid.contracts.xSquidStaking.methods.totalSupply().call())
}

export const stake = async (squidChefContract, pid, amount, account) => {
  console.log(pid, 
    new BigNumber(amount).times(new BigNumber(10).pow(18)).toString())
    console.log(squidChefContract)
  return squidChefContract.methods
    .deposit(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const unstake = async (squidChefContract, pid, amount, account) => {
  return squidChefContract.methods
    .withdraw(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}
export const harvest = async (squidChefContract, pid, account) => {
  return squidChefContract.methods
    .deposit(pid, '0')
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const getStaked = async (squidChefContract, pid, account) => {
  try {
    const { amount } = await squidChefContract.methods
      .userInfo(pid, account)
      .call()
    return new BigNumber(amount)
  } catch {
    return new BigNumber(0)
  }
}

export const redeem = async (squidChefContract, account) => {
  let now = new Date().getTime() / 1000
  if (now >= 1597172400) {
    return squidChefContract.methods
      .exit()
      .send({ from: account })
      .on('transactionHash', (tx) => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert('pool not active')
  }
}

export const enter = async (contract, amount, account) => {
  debugger
  return contract.methods
      .enter(
          new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
      )
      .send({ from: account })
      .on('transactionHash', (tx) => {
        console.log(tx)
        return tx.transactionHash
      })
}

export const leave = async (contract, amount, account) => {
  return contract.methods
      .leave(
          new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
      )
      .send({ from: account })
      .on('transactionHash', (tx) => {
        console.log(tx)
        return tx.transactionHash
      })
}
