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

export const getKiraStakingAddress = (kira) => {
  return kira && kira.kiraStakingAddress
}

export const getKiraAddress = (kira) => {
  return kira && kira.kiraAddress
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

export const getEarned = async (kiraStakingContract, pid, account) => {
  // return kiraStakingContract.methods.pendingSquid(pid, account).call()
  return new BigNumber(0);
}

export const getTotalLPWethValue = async (
  kiraStakingContract,
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
  // Get the share of lpContract that kiraStakingContract owns
  const balance = await lpContract.methods
    .balanceOf(kiraStakingContract.options.address)
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

// Confirmed
export const stake = async (kiraStakingContract, pid, amount, account) => {
  console.log(pid, 
    new BigNumber(amount).times(new BigNumber(10).pow(18)).toString())
  
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


export const getStakedLP = async (kiraStakingContract, pid, account) => {
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
    .deposit(pid, '0')
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}


export const redeem = async (kiraStakingContract, account) => {
  let now = new Date().getTime() / 1000
  if (now >= 1597172400) {
    return kiraStakingContract.methods
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

