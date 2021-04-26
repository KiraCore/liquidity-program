//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./KiraAccessControl.sol";
import "./RewardDistributor.sol";

import "hardhat/console.sol";

contract NFTStaking is Context, ERC1155Holder {
    using SafeMath for uint256;

    IERC1155 nftToken;
    uint256 nftTokenId;

    IERC20 kexToken;

    KiraAccessControl accessControl;
    RewardDistributor distributor;

    mapping(address => bool) whitelist;

    uint256 rewardPerNFT;
    uint256 poolStartTime;
    uint256 poolPeriod;
    uint256 earlyWithdrawal;
    uint256 fullMaturity;
    uint256 poolSize;

    struct STAKE {
        uint256 initTime;
        uint256 lastClaimedAt;
        uint256 amount;
    }

    struct STAKE_DETAIL {
        STAKE[] stakes;
        uint256 rewardSoFar;
        uint256 firstStakedAt;
        uint256 total;
    }

    mapping(address => STAKE_DETAIL) stakingBalance;

    uint256 totalStakes;
    uint256 totalRewards;

    event Stake(address _staker, uint256 amount);
    event Unstake(address _staker, uint256 amount);
    event Withdraw(address _staker, uint256 amount);

    constructor(
        KiraAccessControl _accessControl,
        RewardDistributor _distributor,
        IERC1155 _nftToken,
        uint256 _nftTokenId,
        uint256 _poolSize,
        uint256 _poolStartTime,
        uint256 _poolPeriod,
        uint256 _rewardPerNFT,
        uint256 _earlyWithdrawal,
        uint256 _fullMaturity
    ) {
        accessControl = _accessControl;
        distributor = _distributor;
        nftToken = _nftToken;
        nftTokenId = _nftTokenId;
        poolSize = _poolSize;
        poolStartTime = _poolStartTime;
        poolPeriod = _poolPeriod;
        rewardPerNFT = _rewardPerNFT;
        earlyWithdrawal = _earlyWithdrawal;
        fullMaturity = _fullMaturity;
    }

    modifier onlyManager {
        require(
            accessControl.hasManagerRole(_msgSender()),
            "Need manager role"
        );
        _;
    }

    modifier onlyWhitelisted {
        require(whitelist[_msgSender()], "Need to be whitelisted");
        _;
    }

    /**
     * @notice change access control contract
     * @param _accessControl is new access control contract
     */
    function updateAccessControl(KiraAccessControl _accessControl) public {
        require(
            accessControl.hasAdminRole(_msgSender()),
            "updateAccessControl: Sender must be admin"
        );

        require(
            address(_accessControl) != address(0),
            "updateAccessControl: New access controls cannot be ZERO address"
        );

        accessControl = _accessControl;
    }

    /**
     * @notice change distributor contract
     * @param _distributor is new distributor contract
     */
    function updateDistributor(RewardDistributor _distributor) external {
        require(
            accessControl.hasAdminRole(_msgSender()),
            "updateDistributor: Sender must be admin"
        );

        require(
            address(_distributor) != address(0),
            "updateDistributor: New Distributor cannot be ZERO address"
        );

        distributor = _distributor;
    }

    /**
     * @notice get the earlyWithdrawal
     * @return earlyWithdrawal
     */
    function getEarlyWithdrawal() public view returns (uint256) {
        return earlyWithdrawal;
    }

    /**
     * @notice get the fullMaturity
     * @return fullMaturity
     */
    function getFullMaturity() public view returns (uint256) {
        return fullMaturity;
    }

    /**
     * @notice get the poolPeriod
     * @return poolPeriod
     */
    function getPoolPeriod() public view returns (uint256) {
        return poolPeriod;
    }

    /**
     * @notice get the poolSize
     * @return poolSize
     */
    function getPoolSize() public view returns (uint256) {
        return poolSize;
    }

    /**
     * @notice get the rewardPerNFT
     * @return rewardPerNFT
     */
    function getRewardPerNFT() public view returns (uint256) {
        return rewardPerNFT;
    }

    /**
     * @notice update the reward per nft
     * @param _rewardPerNFT is the new amount for update
     */
    function updateRewardPerNFT(uint256 _rewardPerNFT) public onlyManager {
        rewardPerNFT = _rewardPerNFT;
    }

    /**
     * @notice update the contribution period
     * @param _poolPeriod is the new period for update
     */
    function updatePoolPeriod(uint256 _poolPeriod) public onlyManager {
        poolPeriod = _poolPeriod;
    }

    /**
     * @notice update the earlyWithdrawal
     * @param _earlyWithdrawal is the new earlyWithdrawal for update
     */
    function updateEarlyWithdrawal(uint256 _earlyWithdrawal)
        public
        onlyManager
    {
        earlyWithdrawal = _earlyWithdrawal;
    }

    /**
     * @notice update the fullMaturity
     * @param _fullMaturity is the new fullMaturity for update
     */
    function updateFullMaturity(uint256 _fullMaturity) public onlyManager {
        fullMaturity = _fullMaturity;
    }

    /**
     * @notice add address to the whitelist
     * @param _addr is address to add
     */
    function addToWhitelist(address _addr) public onlyManager {
        whitelist[_addr] = true;
    }

    /**
     * @notice removes address from the whitelist
     * @param _addr is address to remove
     */
    function removeFromWhitelist(address _addr) public onlyManager {
        whitelist[_addr] = false;
    }

    /**
     * @notice check if the staking is started
     * @return isStarted
     */
    function isStakingStarted() public view returns (bool isStarted) {
        isStarted = poolStartTime <= block.timestamp;
    }

    /**
     * @notice check if pool is open
     * @return isOpen
     */
    function isPoolOpen() public view returns (bool isOpen) {
        isOpen =
            isStakingStarted() &&
            poolStartTime + poolPeriod >= block.timestamp &&
            totalStakes < poolSize;
    }

    /**
     * @notice calculate total stakes of staker
     * @param _staker is the address of staker
     * @return _total
     */
    function totalStakeOf(address _staker) public view returns (uint256) {
        return stakingBalance[_staker].total;
    }

    /**
     * @notice calculate entire stake amount
     * @return _total
     */
    function getTotalStakes() public view returns (uint256) {
        return totalStakes;
    }

    /**
     * @notice get the total remaining rewards
     * @return _total
     */
    function getTotalRewards() public view returns (uint256) {
        return totalRewards;
    }

    /**
     * @notice get the poolStartTime
     * @return poolStartTime
     */
    function getPoolStartTime() public view returns (uint256) {
        return poolStartTime;
    }

    /**
     * @notice get the first staked time
     * @return firstStakedAt
     */
    function getFirstStakedAtOf(address _staker) public view returns (uint256) {
        return stakingBalance[_staker].firstStakedAt;
    }

    /**
     * @notice get total claimed reward of staker
     * @return rewardSoFar
     */
    function getRewardSoFarOf(address _staker) public view returns (uint256) {
        return stakingBalance[_staker].rewardSoFar;
    }

    /**
     * @notice calculate reward of staker
     * @return reward is the reward amount of the staker
     */
    function rewardOf(address _staker) public view returns (uint256) {
        STAKE_DETAIL memory _stakeDetail = stakingBalance[_staker];

        if (_stakeDetail.total == 0) return 0;

        uint256 _totalReward;

        for (uint256 i = 0; i < _stakeDetail.stakes.length; i = i.add(1)) {
            STAKE memory _stake = _stakeDetail.stakes[i];
            uint256 maturityAt = _stake.initTime + fullMaturity;

            if (_stake.initTime + earlyWithdrawal > block.timestamp) continue;
            if (
                maturityAt <= block.timestamp &&
                _stake.lastClaimedAt >= maturityAt
            ) continue;

            uint256 timePassed;
            uint256 timeNow = block.timestamp;

            if (timeNow > maturityAt) timeNow = maturityAt;

            timePassed = timeNow - earlyWithdrawal - _stake.initTime;

            if (_stake.lastClaimedAt != _stake.initTime) {
                timePassed = timePassed.sub(
                    _stake.lastClaimedAt - earlyWithdrawal - _stake.initTime
                );
            }
            uint256 _reward =
                _stake.amount.mul(rewardPerNFT).mul(timePassed).div(
                    fullMaturity - earlyWithdrawal
                );

            _totalReward = _totalReward.add(_reward);
        }

        return _totalReward;
    }

    function claimReward() public onlyWhitelisted {
        uint256 reward = rewardOf(_msgSender());
        STAKE_DETAIL storage _stake = stakingBalance[_msgSender()];

        distributor.distribute(_msgSender(), reward);
        for (uint256 i = 0; i < _stake.stakes.length; i = i.add(1)) {
            _stake.stakes[i].lastClaimedAt = block.timestamp;
        }

        _stake.rewardSoFar = _stake.rewardSoFar.add(reward);

        emit Withdraw(_msgSender(), reward);
    }

    /**
     * @notice stake KEX
     * @param _amount is the kex amount to stake
     */
    function stake(uint256 _amount) public onlyWhitelisted {
        require(isPoolOpen(), "Pool is not open");
        require(totalStakes.add(_amount) <= poolSize, "Not enough space");
        // require(
        //     kexToken.balanceOf(_msgSender()) >= _amount,
        //     "Not enough balance"
        // );

        nftToken.safeTransferFrom(
            _msgSender(),
            address(this),
            nftTokenId,
            _amount,
            ""
        );

        STAKE_DETAIL storage _stake = stakingBalance[_msgSender()];

        if (_stake.total == 0) {
            _stake.firstStakedAt = block.timestamp;
        }

        _stake.total = _stake.total.add(_amount);
        _stake.stakes.push(STAKE(block.timestamp, block.timestamp, _amount));
        totalStakes = totalStakes.add(_amount);

        emit Stake(_msgSender(), _amount);
    }

    /**
     * @notice unstake current staking
     */
    function unstake() public onlyWhitelisted {
        require(stakingBalance[_msgSender()].total > 0, "Not staking");

        STAKE_DETAIL storage _stake = stakingBalance[_msgSender()];
        uint256 reward = rewardOf(_msgSender());

        distributor.distribute(_msgSender(), reward);
        nftToken.safeTransferFrom(
            address(this),
            _msgSender(),
            nftTokenId,
            _stake.total,
            ""
        );

        totalStakes = totalStakes.sub(_stake.total);
        _stake.total = 0;
        _stake.rewardSoFar = _stake.rewardSoFar.add(reward);
        _stake.firstStakedAt = 0;
        delete _stake.stakes;

        emit Unstake(_msgSender(), _stake.total);
    }
}
