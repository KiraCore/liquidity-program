// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Authorizable.sol";

struct Staker {
    uint256 amount;
    uint256 stones;
    uint256 timestamp;
}

contract KexFarm is Ownable, Authorizable {
    using SafeMath for uint256;

    // Staking limit is 10'000 KEX
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
        onlyAuthorized
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

        //.amount.div(1e18).mul(_seconds).mul(11574074074074075).div(1e4)
        uint256 _seconds =
            block.timestamp.sub(stakers[staker].timestamp).div(1 seconds);
        return
            stakers[staker].stones.add(
                stakers[staker]
                    .amount
                    .mul(_seconds)
                    .div(1e6)
                    .div(3600)
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
