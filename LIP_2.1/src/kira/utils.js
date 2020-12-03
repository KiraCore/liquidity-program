import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export const getKiraStakingAddress = (kira) => {
  return kira && kira.kiraStakingAddress
}

export const getKiraAddress = (kira) => {
  return kira && kira.kiraAddress
}

export const getWethAddress = (kira) => {
  return kira && kira.wethAddress
}

export const getLPAddress = (kira) => {
  return kira && kira.contracts && kira.contracts.pools[0].lpAddress
}

export const getWethContract = (kira) => {
  return kira && kira.contracts && kira.contracts.weth
}

export const getKiraStakingContract = (kira) => {
  return kira && kira.contracts && kira.contracts.kiraStaking
}

export const getKiraContract = (kira) => {
  return kira && kira.contracts && kira.contracts.kira
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
          earnToken: 'KEX',
          earnTokenAddress: kira.contracts.kira.options.address,
          icon,
        }),
      )
    : []
}

export const getTotalLPWethValue = async (
  kiraStakingContract,
  wethContract,
  lpContract,
  tokenContract,
  pid,
) => {
  // Get balance of the KEX token locked in Pair Contract
  const kexBalanceLockedInPool = await tokenContract.methods
    .balanceOf(lpContract.options.address)
    .call()
  const tokenDecimals = await tokenContract.methods.decimals().call()

  // Get the share of lpContract that staking contract owns
  const lpTotalLockedInStaking = await lpContract.methods
    .balanceOf(kiraStakingContract.options.address)
    .call()
  // Convert that into the portion of total lpContract = p1
  const lpTotalLockedInPool = await lpContract.methods.totalSupply().call()
  // Get total weth value for the lpContract = w1
  const lpContractWeth = await wethContract.methods
    .balanceOf(lpContract.options.address)
    .call()

  // Return p1 * w1 * 2
  const portionLp = new BigNumber(lpTotalLockedInStaking).div(new BigNumber(lpTotalLockedInPool))
  console.log("PortionLP: ", portionLp.toNumber())
  const lpWethWorth = new BigNumber(lpContractWeth)
  const totalLpWethValue = portionLp.times(lpWethWorth).times(new BigNumber(2))

  // Calculate
  const kexBalanceLockedInStaking = new BigNumber(kexBalanceLockedInPool)
    .times(portionLp)
    .div(new BigNumber(10).pow(tokenDecimals))

  const wethBalanceLockedInStaking = new BigNumber(lpContractWeth)
    .times(portionLp)
    .div(new BigNumber(10).pow(18))

  return {
    tokenAmountInStaking: kexBalanceLockedInStaking,
    wethAmountStaking: wethBalanceLockedInStaking,
    tokenAmountInPool: kexBalanceLockedInPool,
    wethAmountInPool: lpContractWeth,
    totalWethValue: totalLpWethValue.div(new BigNumber(10).pow(18)),
    tokenPriceInWeth: wethBalanceLockedInStaking.div(kexBalanceLockedInStaking),
  }
}

export const approve = async (lpContract, kiraStakingContract, account) => {
  return lpContract.methods
    .approve(kiraStakingContract.options.address, ethers.constants.MaxUint256)
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

export const getTotalLPInStaking = async(kiraStakingContract) => {
  return kiraStakingContract.methods.totalSupply().call()
}

export const getRewardRate = async(kiraStakingContract) => {
  return new BigNumber(await kiraStakingContract.methods.rewardRate().call())
}

// Confirmed
export const stake = async (kiraStakingContract, pid, amount, account) => {
  return kiraStakingContract.methods.stake(
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

// Confirmed
export const unstake = async (kiraStakingContract, pid, amount, account) => {
  return kiraStakingContract.methods.withdraw(
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const getEarned = async (kiraStakingContract, pid, account) => {
  return kiraStakingContract.methods.earned(account).call();
}

export const getStakedLP = async (kiraStakingContract, account) => {
  try {
    const amount = await kiraStakingContract.methods
      .balanceOf(account)
      .call()
    return new BigNumber(amount);
  } catch {
    return new BigNumber(0)
  }
}

export const harvest = async (kiraStakingContract, pid, account) => {
  return kiraStakingContract.methods
    .getReward()
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const getPairAddress = async(uniswapV2Factory, tokenA, tokenB) => {
  return uniswapV2Factory.methods.getPair(tokenA, tokenB).call()
}