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

export const getKiraChefAddress = (kira) => {
  return kira && kira.kiraChefAddress
}
export const getKiraAddress = (kira) => {
  return kira && kira.kiraAddress
}
export const getWethContract = (kira) => {
  return kira && kira.contracts && kira.contracts.weth
}

export const getKiraChefContract = (kira) => {
  return kira && kira.contracts && kira.contracts.kiraChef
}
export const getKiraContract = (kira) => {
  return kira && kira.contracts && kira.contracts.kira
}

export const getXKiraStakingContract = (kira) => {
  return kira && kira.contracts && kira.contracts.xKiraStaking
}

export const getFarms = (kira) => {
  return kira
    ? kira.contracts.pools.map(
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
          earnToken: 'kira',
          earnTokenAddress: kira.contracts.kira.options.address,
          icon,
        }),
      )
    : []
}

export const getPoolWeight = async (kiraChefContract, pid) => {
  const { allocPoint } = await kiraChefContract.methods.poolInfo(pid).call()
  const totalAllocPoint = await kiraChefContract.methods
    .totalAllocPoint()
    .call()
  return new BigNumber(allocPoint).div(new BigNumber(totalAllocPoint))
}

export const getEarned = async (kiraChefContract, pid, account) => {
  return kiraChefContract.methods.pendingSquid(pid, account).call()
}

export const getTotalLPWethValue = async (
  kiraChefContract,
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
  // Get the share of lpContract that kiraChefContract owns
  const balance = await lpContract.methods
    .balanceOf(kiraChefContract.options.address)
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
    poolWeight: await getPoolWeight(kiraChefContract, pid),
  }
}

export const approve = async (lpContract, kiraChefContract, account) => {
  return lpContract.methods
    .approve(kiraChefContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account })
}

export const approveAddress = async (lpContract, address, account) => {
  return lpContract.methods
      .approve(address, ethers.constants.MaxUint256)
      .send({ from: account })
}

export const getKiraSupply = async (kira) => {
  return new BigNumber(await kira.contracts.kira.methods.totalSupply().call())
}

export const getXKiraSupply = async (kira) => {
  return new BigNumber(await kira.contracts.xKiraStaking.methods.totalSupply().call())
}

export const stake = async (kiraChefContract, pid, amount, account) => {
  console.log(pid, 
    new BigNumber(amount).times(new BigNumber(10).pow(18)).toString())
    console.log(kiraChefContract)
  return kiraChefContract.methods
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

export const unstake = async (kiraChefContract, pid, amount, account) => {
  return kiraChefContract.methods
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
export const harvest = async (kiraChefContract, pid, account) => {
  return kiraChefContract.methods
    .deposit(pid, '0')
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const getStaked = async (kiraChefContract, pid, account) => {
  try {
    const { amount } = await kiraChefContract.methods
      .userInfo(pid, account)
      .call()
    return new BigNumber(amount)
  } catch {
    return new BigNumber(0)
  }
}

export const redeem = async (kiraChefContract, account) => {
  let now = new Date().getTime() / 1000
  if (now >= 1597172400) {
    return kiraChefContract.methods
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
