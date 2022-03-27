//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;

import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';

struct STAKE {
    uint256 amount;
    uint256 rewardSoFar;
    uint256 firstStakedAt;
    uint256 lastClaimedAt;
}

struct POOL {
    uint256 poolId;
    uint256 nftTokenId;
    uint256 totalStakes;
    uint256 totalRewards;
    uint256 rewardPerNFT;
}

contract NFTStaking is Context, ERC1155Holder, Ownable {
    using SafeERC20 for IERC20;

    /// @dev map poolId to staking Pool detail
    uint public stakingPoolsCount;
    mapping(uint256 => POOL) stakingPools;
    mapping(uint256 => mapping(address => STAKE)) balances;
    IERC20 private _token;
    IERC1155 private _nftToken;

    constructor(IERC20 tokenAddress, IERC1155 nftTokenAddress) {
        _token = tokenAddress;
        _nftToken = nftTokenAddress;
        stakingPoolsCount = 0;
    }

    function setTokenAddress(IERC20 tokenAddress) external onlyOwner {
        _token = tokenAddress;
    }

    function setNftTokenAddress(IERC1155 nftTokenAddress) external onlyOwner {
        _nftToken = nftTokenAddress;
    }

    event Stake(uint256 indexed poolId, address staker, uint256 amount);
    event Unstake(uint256 indexed poolId, address staker, uint256 amount);
    event Withdraw(uint256 indexed poolId, address staker, uint256 amount);

    /**
     * @notice get pool rewards by specific token
     * @return sum of all remaining rewards in specific token among all pools
     */
    function getPoolRewards() public view returns (uint256) {
        uint total = 0;
        for (uint i = 0; i < stakingPoolsCount; i++) {
            POOL memory pool = stakingPools[i];
            uint poolRewards = pool.totalRewards;
            total = total + poolRewards;
            assert(total >= poolRewards);
        }
        return total;
    }

    /**
     * @notice get staking pool by id
     * @param poolId is the staking pool identifier
     * @return stakingPool
     */
    function getPool(uint256 poolId) public view returns (POOL memory) {
      return stakingPools[poolId];
    }

    /**
     * @notice gets staking pool by NFT id with highest remaining rewards
     * @param nftId is the NFT identifier
     * @param _staker is the staker for whom we are looking for the best pool
     * @return stakingPool
     */
    function getPool(uint256 nftId, address _staker) public view returns (POOL memory) {
        POOL memory poolInfo;
        for (uint i = 0; i < stakingPoolsCount; i++) {
            uint256 poolNftId = stakingPools[i].nftTokenId;
            uint256 poolRewards = rewardOf(i, _staker);
            if (poolNftId == nftId) {
                poolInfo = stakingPools[i];
                if (poolRewards > 0) {
                    poolInfo = stakingPools[i];
                    break;
                }
            }
        }
      return poolInfo;
    }

    /**
     * @notice gets staking pool stake
     * @param nftId is the NFT identifier
     * @param _staker is the staker for whose stake we are looking for
     * @return stakingPool
     */
    function getBalance(uint256 nftId, address _staker) public view returns (STAKE memory) {
        POOL memory poolInfo = getPool(nftId, _staker);
        uint poolId = poolInfo.poolId;
        return balances[poolId][_staker];
    }

    /**
     * @notice calculate total stakes of staker
     * @param _staker is the address of staker
     * @return _total
     */
    function totalStakeOf(uint256 poolId, address _staker) public view returns (uint256) {
        return balances[poolId][_staker].amount;
    }

    /**
     * @notice calculate entire stake amount
     * @return _total
     */
    function getTotalStakes(uint256 poolId) public view returns (uint256) {
        return stakingPools[poolId].totalStakes;
    }

    /**
     * @notice get the first staked time
     * @return firstStakedAt
     */
    function getFirstStakedAtOf(uint256 poolId, address _staker) public view returns (uint256) {
        return balances[poolId][_staker].firstStakedAt;
    }

    /**
     * @notice get total claimed reward of staker
     * @return rewardSoFar
     */
    function getRewardSoFarOf(uint256 poolId, address _staker) public view returns (uint256) {
        return balances[poolId][_staker].rewardSoFar;
    }

    /**
     * @notice calculate reward of staker
     * @return reward is the reward amount of the staker
     */
    function rewardOf(uint256 poolId, address _staker) public view returns (uint256) {
        POOL memory poolInfo = stakingPools[poolId];
        STAKE memory stakeDetail = balances[poolId][_staker];

        if (stakeDetail.amount == 0) return 0;

        uint256 timePassed;
        uint256 timeNow = block.timestamp;

        timePassed = timeNow - stakeDetail.lastClaimedAt;

        uint256 _totalReward = stakeDetail.amount.mul(poolInfo.rewardPerNFT).mul(timePassed).div(30 days);

        if (_totalReward > poolInfo.totalRewards) return poolInfo.totalRewards;
        return _totalReward;
    }

    function claimReward(uint256 poolId) public {
        uint256 reward = rewardOf(poolId, _msgSender());

        POOL memory poolInfo = stakingPools[poolId];
        STAKE storage _stake = balances[poolId][_msgSender()];

        _token.transfer(_msgSender(), reward);
        _stake.lastClaimedAt = block.timestamp;
        _stake.rewardSoFar = _stake.rewardSoFar.add(reward);
        poolInfo.totalRewards = poolInfo.totalRewards.sub(reward);

        emit Withdraw(poolId, _msgSender(), reward);
    }

    /**
     * @notice stake NFT
     * @param _amount is the NFT count to stake
     */
    function stake(uint256 poolId, uint256 _amount) external {
        POOL memory poolInfo = stakingPools[poolId];

        _nftToken.safeTransferFrom(_msgSender(), address(this), poolInfo.nftTokenId, _amount, '');

        STAKE storage _stake = balances[poolId][_msgSender()];

        if (_stake.amount > 0) {
            uint256 reward = rewardOf(poolId, _msgSender());

            _token.transfer(_msgSender(), reward);
            _stake.rewardSoFar = _stake.rewardSoFar.add(reward);
            poolInfo.totalRewards = poolInfo.totalRewards.sub(reward);

            emit Withdraw(poolId, _msgSender(), reward);
        }
        if (_stake.amount == 0) _stake.firstStakedAt = block.timestamp;

        _stake.lastClaimedAt = block.timestamp;
        _stake.amount = _stake.amount.add(_amount);
        stakingPools[poolId].totalStakes = stakingPools[poolId].totalStakes.add(_amount);

        emit Stake(poolId, _msgSender(), _amount);
    }

    /**
     * @notice unstake current staking
     */
    function unstake(uint256 poolId, uint256 count) external {
        require(balances[poolId][_msgSender()].amount > 0, 'Not staking');

        POOL memory poolInfo = stakingPools[poolId];
        STAKE storage _stake = balances[poolId][_msgSender()];
        uint256 reward = rewardOf(poolId, _msgSender()).div(_stake.amount).mul(count);

        _token.transfer(_msgSender(), reward);
        _nftToken.safeTransferFrom(address(this), _msgSender(), poolInfo.nftTokenId, count, '');

        poolInfo.totalStakes = poolInfo.totalStakes.sub(count);
        poolInfo.totalRewards = poolInfo.totalRewards.sub(reward);

        _stake.amount = _stake.amount.sub(count);
        _stake.rewardSoFar = _stake.rewardSoFar.add(reward);

        if (_stake.amount == 0) {
            _stake.firstStakedAt = 0;
            _stake.lastClaimedAt = 0;
        }

        emit Unstake(poolId, _msgSender(), count);
    }

    /**
     * @notice function to notify contract how many rewards to assign for the pool
     * @param poolId is the pool id to contribute reward
     * @param amount is the amount to put
     */
    function notifyRewards(uint256 poolId, uint256 amount) public onlyOwner {
        require(amount > 0, "NFTStaking.notifyRewards: Can't add zero amount!");

        POOL storage poolInfo = stakingPools[poolId];
        uint total = _token.balanceOf(address(this));
        uint reserved = getPoolRewards();

        require(total.sub(reserved) >= amount, "NFTStaking.notifyRewards: Can't add more tokens than available");
        poolInfo.totalRewards = poolInfo.totalRewards.add(amount);
    }

    /**
     * @notice function to claim staking rewards from the contract
     * @param poolId is the pool id to contribute reward
     * @param amount is the amount to claim
     */
    function withdrawRewards(uint256 poolId, uint256 amount) public onlyOwner {
        require(stakingPools[poolId].totalRewards >= amount, 'NFTStaking.withdrawRewards: Not enough remaining rewards!');
        POOL storage poolInfo = stakingPools[poolId];
        _token.transfer(_msgSender(), amount);
        poolInfo.totalRewards = poolInfo.totalRewards.sub(amount);
    }

    function addPool(
        uint256 nftTokenId,
        uint256 rewardPerNFT
    ) public onlyOwner {
        uint256 poolId = stakingPoolsCount;
        require(stakingPools[poolId].rewardPerNFT == 0, 'NFTStaking.addPool: Pool already exists!');
        require(stakingPools[poolId].poolId == 0, 'NFTStaking.addPool: poolId already exists!');

        stakingPools[poolId] = POOL(poolId, nftTokenId, 0, 0, rewardPerNFT);
        stakingPoolsCount++;
    }
}
