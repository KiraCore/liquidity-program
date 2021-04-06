//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./KiraAccessControl.sol";

import "hardhat/console.sol";

contract RewardDistributor is Context {
    using SafeMath for uint256;
    IERC20 kexToken;
    KiraAccessControl accessControl;
    uint256 totalRewards;

    constructor(IERC20 _kexToken, KiraAccessControl _accessControl) {
        kexToken = _kexToken;
        accessControl = _accessControl;
    }

    modifier onlyManager {
        require(
            accessControl.hasManagerRole(_msgSender()),
            "Need manager role"
        );
        _;
    }

    /**
     * @notice give reward to the staker
     * @param _beneficiary is the beneficiary
     * @param _amount is the amount to give
     */
    function distribute(address _beneficiary, uint256 _amount)
        external
        onlyManager
    {
        require(
            kexToken.transfer(_beneficiary, _amount),
            "Distribute: KexToken.Transfer: Failed to Distribute!"
        );
        totalRewards = totalRewards.sub(_amount);
    }

    /**
     * @notice deposite reward
     * @param _amount to deposite
     */
    function depositeReward(uint256 _amount) external onlyManager {
        require(
            kexToken.transferFrom(_msgSender(), address(this), _amount),
            "Deposite: KexToken.TransferFrom: Failed to Deposite!"
        );
        totalRewards = totalRewards.add(_amount);
    }

    /**
     * @notice withdraw reward
     * @param _amount to withdraw
     */
    function withdrawReward(uint256 _amount) external onlyManager {
        require(
            kexToken.transferFrom(_msgSender(), address(this), _amount),
            "Withdraw: KexToken.TransferFrom: Failed to Deposite!"
        );
        totalRewards = totalRewards.sub(_amount);
    }
}
