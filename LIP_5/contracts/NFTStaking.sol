//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;

import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

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
    uint256 rewardPeriod;
    uint256 maxPerClaim;
}

contract NFTStaking is Context, ERC1155Holder, Ownable {
    using SafeERC20 for IERC20;

    /// @dev map poolId to staking Pool detail
    uint public stakingPoolsCount;
    mapping(uint256 => POOL) stakingPools;
    mapping(uint256 => mapping(address => STAKE)) balances;
    IERC20 private _token;
    IERC1155 private _nftToken;

    constructor(IERC20 _tokenAddress, IERC1155 _nftTokenAddress) {
        _token = _tokenAddress;
        _nftToken = _nftTokenAddress;
        stakingPoolsCount = 0;
    }

    function setTokenAddress(IERC20 _tokenAddress) external onlyOwner {
        _token = _tokenAddress;
    }

    function setNftTokenAddress(IERC1155 _nftTokenAddress) external onlyOwner {
        _nftToken = _nftTokenAddress;
    }

    event Stake(uint256 indexed poolId, address staker, uint256 amount);
    event Unstake(uint256 indexed poolId, address staker, uint256 amount);
    event Withdraw(uint256 indexed poolId, address staker, uint256 amount);

    /**
     * @notice get remaining rewards from all existing pools
     * @return rewardsTotal
     */
    function getReservedRewards() public view returns (uint256) {
        uint256 total = 0;
        for (uint i = 0; i < stakingPoolsCount; i++) {
            uint256 poolRewards = stakingPools[i].totalRewards;
            total = total.add(poolRewards);
        }
        return total;
    }

    /**
     * @notice get staking pool by id
     * @param _poolId is the staking pool identifier
     * @return stakingPool
     */
    function getPool(uint256 _poolId) public view returns (POOL memory) {
      require((_poolId >= 0 && _poolId < stakingPoolsCount), "Invalid poolId range");
      return stakingPools[_poolId];
    }

    /**
     * @notice gets staking pool by NFT id or the pool with most available rewards
     * @param _nftId is the NFT identifier
     * @param _staker is the staker for whom we are looking for the best pool
     * @return stakingPool
     */
    function getPool(uint256 _nftId, address _staker) public view returns (POOL memory) {
        // return undefined pool if nothing is found
        POOL memory poolInfoBestAvailable = POOL(0,0,0,0,0,0,0);
        for (uint i = 0; i < stakingPoolsCount; i++) {
            POOL memory poolInfo = stakingPools[i];

            // ignore all pools not relevant to searched token
            if (poolInfo.nftTokenId != _nftId) continue;

            uint amount = balances[i][_staker].amount;

            // return immediately first pool if user has anything already staked with the pool that was just found
            if (amount > 0) return poolInfo;
            if (poolInfo.totalRewards >= poolInfoBestAvailable.totalRewards) poolInfoBestAvailable = poolInfo;
        }

      return poolInfoBestAvailable;
    }

    /**
     * @notice gets the staker balance of for the staking pool that can give the most rewards
     * @param _nftId is the NFT identifier
     * @param _staker is the staker for whose stake we are looking for
     * @return stakingBalance
     */
    function getBalance(uint256 _nftId, address _staker) public view returns (STAKE memory) {
        // get pool that gives max possible rewards at the current time instance
        POOL memory poolInfo = getPool(_nftId, _staker);

        uint poolDefined = poolInfo.rewardPeriod;
        // if pool is undefined
        if (poolDefined == 0) return STAKE(0,0,0,0);

        // pool is defined, return balance
        uint poolId = poolInfo.poolId;
        return balances[poolId][_staker];
    }

    /**
     * @notice gets the staker balance of for the specific staking pool
     * @param _staker is the staker for whose stake we are looking for
     * @param _poolId is the pool identifier
     * @return stakingBalance
     */
    function getBalance(address _staker, uint256 _poolId) public view returns (STAKE memory) {
        require((_poolId >= 0 && _poolId < stakingPoolsCount), "Invalid poolId range");
        return balances[_poolId][_staker];
    }

    /**
     * @notice gets amount of staker claimable rewards by nft identifier
     * @param _nftId is the NFT identifier
     * @param _staker is the staker for whose stake we are looking for
     * @return claimable rewards amount
     */
    function getRewards(uint256 _nftId, address _staker) public view returns (uint256) {
        // get pool that gives max possible rewards at the current time instance
        POOL memory poolInfo = getPool(_nftId, _staker);

        uint poolDefined = poolInfo.rewardPeriod;
        // if pool is undefined
        if(poolDefined == 0) return 0;

        return rewardOf(poolInfo.poolId, _staker);
    }

    /**
     * @notice calculate total stakes of staker
     * @param _poolId is the pool identifier
     * @param _staker is the address of staker
     * @return _total
     */
    function totalStakeOf(uint256 _poolId, address _staker) public view returns (uint256) {
        return balances[_poolId][_staker].amount;
    }

    /**
     * @notice calculate entire stake amount
     * @param _poolId is the pool identifier
     * @return _total
     */
    function getTotalStakes(uint256 _poolId) public view returns (uint256) {
        return stakingPools[_poolId].totalStakes;
    }

    /**
     * @notice get the first staked time
     * @param _poolId is the pool identifier
     * @return firstStakedAt
     */
    function getFirstStakedAtOf(uint256 _poolId, address _staker) public view returns (uint256) {
        return balances[_poolId][_staker].firstStakedAt;
    }

    /**
     * @notice get total claimed reward of staker
     * @param _poolId is the pool identifier
     * @return rewardSoFar
     */
    function getRewardSoFarOf(uint256 _poolId, address _staker) public view returns (uint256) {
        return balances[_poolId][_staker].rewardSoFar;
    }

    /**
     * @notice calculate reward of staker
     * @param _poolId is the pool identifier
     * @return reward is the reward amount of the staker
     */
    function rewardOf(uint256 _poolId, address _staker) public view returns (uint256) {
        STAKE memory balanceInfo = balances[_poolId][_staker];

        // if staker is NOT staking the token anymore then rewards is always 0 because claim is triggered on withdraw
        // notice that lastClaimedAt is set at the time of stake event occuring, if user didnt staked anything then timePassed calculations would NOT be valid
        if (balanceInfo.amount == 0) return 0;

        POOL memory poolInfo = stakingPools[_poolId];

        uint256 timeNow = block.timestamp;
        // passed time in seconds since the last claim
        uint256 timePassed = timeNow - balanceInfo.lastClaimedAt;
        uint256 totalReward = balanceInfo.amount.mul(poolInfo.rewardPerNFT).mul(timePassed).div(poolInfo.rewardPeriod);

        // there can be a situation where someone is staking for a very long time and no one is claiming, then sudenly 1 person ruggs everyone
        // to solve this issue we force people to claim every time they accumulate maxPerClaim and thus available rewards don't suddenly go to 0
        if (totalReward > poolInfo.maxPerClaim) totalReward = poolInfo.maxPerClaim;

        // there can be a situation where someone is staking longer than others and claimed multiple times
        // we should inform everyone about this by decreasing everyone max claim
        uint256 fairRewardPerNFT = poolInfo.totalRewards.div(poolInfo.totalStakes);
        uint256 maxFairReward = balanceInfo.amount.mul(fairRewardPerNFT);
        if (totalReward > maxFairReward) totalReward = maxFairReward;

        if (totalReward > poolInfo.totalRewards) totalReward = poolInfo.totalRewards;
        return totalReward;
    }

    function claimReward(uint256 _poolId) external nonReentrant {
        require((_poolId >= 0 && _poolId < stakingPoolsCount), "Invalid poolId range");
        uint256 reward = rewardOf(_poolId, _msgSender());
        POOL storage poolInfo = stakingPools[_poolId];
        STAKE storage balanceInfo = balances[_poolId][_msgSender()];

        _token.transfer(_msgSender(), reward);

        balanceInfo.lastClaimedAt = block.timestamp;
        balanceInfo.rewardSoFar = balanceInfo.rewardSoFar.add(reward);
        poolInfo.totalRewards = poolInfo.totalRewards.sub(reward);

        emit Withdraw(_poolId, _msgSender(), reward);
    }

    /**
     * @notice stake NFT
     * @param _poolId is the pool identifier
     * @param _amount is the NFT count to stake
     */
    function stake(uint256 _poolId, uint256 _amount) external nonReentrant {
        require((_poolId >= 0 && _poolId < stakingPoolsCount), "Invalid poolId range");
        POOL storage poolInfo = stakingPools[_poolId];

        _nftToken.safeTransferFrom(_msgSender(), address(this), poolInfo.nftTokenId, _amount, '');

        STAKE storage balance = balances[_poolId][_msgSender()];

        if (balance.amount > 0) {
            uint256 reward = rewardOf(_poolId, _msgSender());

            _token.transfer(_msgSender(), reward);
            balance.rewardSoFar = balance.rewardSoFar.add(reward);
            poolInfo.totalRewards = poolInfo.totalRewards.sub(reward);

            emit Withdraw(_poolId, _msgSender(), reward);
        }
        if (balance.amount == 0) balance.firstStakedAt = block.timestamp;

        balance.lastClaimedAt = block.timestamp;
        balance.amount = balance.amount.add(_amount);
        stakingPools[_poolId].totalStakes = stakingPools[_poolId].totalStakes.add(_amount);

        emit Stake(_poolId, _msgSender(), _amount);
    }

    /**
     * @notice unstake current staking
     * @param _poolId is the pool identifier
     * @param _count number of tokens to unstake
     */
    function unstake(uint256 _poolId, uint256 _count) external nonReentrant {
        STAKE storage balance = balances[_poolId][_msgSender()];
        require((balance.amount >= _count && _count > 0), 'Unsufficient stake');

        POOL storage poolInfo = stakingPools[_poolId];
        uint256 reward = rewardOf(_poolId, _msgSender()).mul(_count).div(balance.amount);

        _token.transfer(_msgSender(), reward);
        _nftToken.safeTransferFrom(address(this), _msgSender(), poolInfo.nftTokenId, _count, '');

        poolInfo.totalStakes = poolInfo.totalStakes.sub(_count);
        poolInfo.totalRewards = poolInfo.totalRewards.sub(reward);

        balance.amount = balance.amount.sub(_count);
        balance.rewardSoFar = balance.rewardSoFar.add(reward);

        if (balance.amount == 0) {
            balance.firstStakedAt = 0;
            balance.lastClaimedAt = 0;
        }

        emit Unstake(_poolId, _msgSender(), _count);
    }

    /**
     * @notice function to notify contract how many rewards to assign for the specific pool
     * @param _poolId is the pool id to contribute reward
     * @param _amount is the amount to put
     */
    function notifyRewards(uint256 _poolId, uint256 _amount) external onlyOwner {
        require(_amount > 0, "NFTStaking.notifyRewards: Can't add zero amount!");

        POOL storage poolInfo = stakingPools[_poolId];
        uint total = _token.balanceOf(address(this));
        uint reserved = getReservedRewards();

        require(total.sub(reserved) >= _amount, "NFTStaking.notifyRewards: Can't add more tokens than available");
        poolInfo.totalRewards = poolInfo.totalRewards.add(_amount);
    }

    /**
     * @notice function to forecefully remove staking rewards from the pool into owner's wallet
     * @param _poolId is the pool id to contribute reward
     * @param _amount is the amount to claim
     */
    function withdrawRewards(uint256 _poolId, uint256 _amount) public onlyOwner {
        POOL storage poolInfo = stakingPools[_poolId];
        require(poolInfo.totalRewards >= _amount, 'NFTStaking.withdrawRewards(_poolId, _amount): Not enough remaining rewards!');

        _token.transfer(_msgSender(), _amount);
        poolInfo.totalRewards = poolInfo.totalRewards.sub(_amount);
    }

    /**
     * @notice function to forecefully remove ALL staking rewards from the pool into owner's wallet
     * @param _poolId is the pool id to contribute reward
     */
    function withdrawRewards(uint256 _poolId) external onlyOwner {
        POOL memory poolInfo = stakingPools[_poolId];
        require(poolInfo.totalRewards > 0, 'NFTStaking.withdrawRewards(_poolId): Staking pool is already empty');
        withdrawRewards(_poolId, poolInfo.totalRewards);
    }

    /**
     * @notice adds new staking pool
     * @param _nftTokenId is the token id that can be staked to the pool
     * @param _rewardPerNFT is the amount of rewards token can receive over the rewar period 
     * @param _rewardPeriod is the numer of seconds within each nft can earn the amount equal to rewardPerNFT
     * @param _maxPerClaim each account has restriction regarding max amount per each rewards claim, this way rewards do NOT suddenly disappear when users check their rewards balances
     */
    function addPool(
        uint256 _nftTokenId,
        uint256 _rewardPerNFT,
        uint256 _rewardPeriod,
        uint256 _maxPerClaim
    ) external onlyOwner {
        uint256 poolId = stakingPoolsCount;
        require((_rewardPeriod >= 3600 && _rewardPeriod <= 31556925), "NFTStaking.addPool: Rewards period must be within 1h & 1Y");
        require(_maxPerClaim > 0, "NFTStaking.addPool: Rewards max per each claim can NOT be 0");
        require(stakingPools[poolId].rewardPerNFT == 0, 'NFTStaking.addPool: Pool already exists!');
        require(stakingPools[poolId].poolId == 0, 'NFTStaking.addPool: poolId already exists!');
        require(stakingPools[poolId].rewardPeriod == 0, 'NFTStaking.addPool: Pool already exists!');

        stakingPools[poolId] = POOL(poolId, _nftTokenId, 0, 0, _rewardPerNFT, _rewardPeriod, _maxPerClaim);
        stakingPoolsCount++;
    }
}
