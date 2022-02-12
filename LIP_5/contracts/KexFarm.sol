// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

struct Staker {
    uint256 amount;
    uint256 stones;
    uint256 timestamp;
}

// Allow anyone who has KEX to earn Krystals
// Allow ANYONE who has Krystals to pay for NFT minting
contract KexFarm is Ownable {
    using SafeMath for uint256;

    // Staking limit is 10'000 KEX
    // Take into account that KEX has 6 decimals
    uint256 public limit = 10000 * 10**6;
    uint256 public total;

    mapping(address => Staker) public stakers;
    IERC20 private _token;

    constructor(IERC20 _tokenAddr) {
        _token = _tokenAddr;
    }

    function setTokenAddress(IERC20 token_) external onlyOwner {
        _token = token_;
    }

    function giveAway(address _address, uint256 stones) external onlyOwner {
        stakers[_address].stones = stones;
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
        consolidate(buyer);
        require(stakers[buyer].stones >= amount, "Insufficient stones!");
        stakers[buyer].stones = stakers[buyer].stones.sub(amount);

        return true;
    }

    function rewardedStones(address staker) public view returns (uint256) {
        if (stakers[staker].amount < 1000) {
            return stakers[staker].stones;
        }

        // Earn Rate = 1 Krystal every 24 hours per each 1 KEX staked
        uint256 _seconds =
            block.timestamp.sub(stakers[staker].timestamp).div(1 seconds);
        return
            stakers[staker].stones.add(
                stakers[staker]
                    .amount
                    .mul(_seconds)
                    .div(1e6)
                    .div(86400)
            );
    }

    function consolidate(address staker) internal {
        uint256 stones = rewardedStones(staker);
        stakers[staker].stones = stones;
        stakers[staker].timestamp = block.timestamp;
    }

    function deposit(uint256 amount) public {
        address sender = msg.sender;
        require(stakers[sender].amount.add(amount) <= limit, "Limit 10000 KEX");

        _token.transferFrom(sender, address(this), amount);
        consolidate(sender);
        total = total.add(amount);
        stakers[sender].amount = stakers[sender].amount.add(amount);
        // stakers[sender].timestamp = block.timestamp;
    }

    function withdraw(uint256 amount) public {
        address sender = msg.sender;

        require(stakers[sender].amount >= amount, "Insufficient amount!");
        require(_token.transfer(sender, amount), "Transfer error!");

        consolidate(sender);
        stakers[sender].amount = stakers[sender].amount.sub(amount);
        total = total.sub(amount);
        // stakers[sender].timestamp = block.timestamp;
    }
}
