// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

struct Staker {
    uint256 amount;
    uint256 stones;
    uint256 timestamp;
}

// Allow anyone who has KEX to earn Krystals
// Allow ANYONE who has Krystals to pay for NFT minting
contract KexFarm is Ownable {
    using SafeERC20 for IERC20;

    // Staking limit is 10'000 KEX
    // Take into account that KEX has 6 decimals
    uint256 public limit = 10000 * 10**6;
    uint256 public total;

    mapping(address => Staker) public stakers;

    // token used to mint stones
    IERC20 private _token;
    // contract that mints nfts based on stone amounts
    IERC20 private _minter;

    constructor(IERC20 token) {
        _token = token;
    }

    // Ownership is expected to be rejected after deployment
    function setTokenAddress(IERC20 token) external onlyOwner {
        _token = token;
    }
    // Ownership is expected to be rejected after deployment
    function setMinterAddress(IERC20 minter) external onlyOwner {
        _minter = minter;
    }

    function farmed(address sender) public view returns (uint256) {
        // Returns how many KEX this account has farmed
        return (stakers[sender].amount);
    }

    function farmedStart(address sender) public view returns (uint256) {
        // Returns when this account started farming
        return (stakers[sender].timestamp);
    }

    function payment(address buyer, uint256 amount)
        external
        returns (bool)
    {
        require(msg.sender == address(_minter), "Sender must be a KiraNFT contract!");

        consolidate(buyer);
        require(stakers[buyer].stones >= amount, "Insufficient stones!");
        stakers[buyer].stones = stakers[buyer].stones - amount;

        return true;
    }

    function rewardedStones(address staker) public view returns (uint256) {
        if (stakers[staker].amount < 1000) {
            return stakers[staker].stones;
        }

        // Earn Rate = 1 Krystal every 24 hours per each 1 KEX staked
        uint256 _seconds = ( block.timestamp - stakers[staker].timestamp ) / (1 seconds);
        return (stakers[staker].stones + ((( stakers[staker].amount * _seconds ) / (1e6)) / (86400)));
    }

    function consolidate(address staker) internal {
        uint256 stones = rewardedStones(staker);
        stakers[staker].stones = stones;
        stakers[staker].timestamp = block.timestamp;
    }

    function deposit(uint256 amount) public {
        address sender = msg.sender;
        require((stakers[sender].amount + amount) <= limit, "Limit 10000 KEX");

        _token.transferFrom(sender, address(this), amount);
        consolidate(sender);
        total = total + amount;
        stakers[sender].amount = stakers[sender].amount + amount;
    }

    function withdraw(uint256 amount) public {
        address sender = msg.sender;

        require(stakers[sender].amount >= amount, "Insufficient amount!");
        require(_token.transfer(sender, amount), "Transfer error!");

        consolidate(sender);
        stakers[sender].amount = stakers[sender].amount - amount;
        total = total - amount;
    }
}
