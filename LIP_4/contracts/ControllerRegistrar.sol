//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";

error NotEnoughThreshold(uint256 threshold, uint256 total_count);

contract ControllerRegistrar {
    bool public active; // defines if initial setup was completed
    uint256 public threshold; // the M count from the M/N parameter
    uint256 public count; // the N count, always equal to number of accounts
    address public owner; // initial deployer of the contract
    mapping(address => bool) public whitelisted; // whitelisted accounts taking part in the consensus

    event SetActived(address _owner);
    event SetChanged(uint256 _threshold, uint256 _count);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this.");
        _;
    }

    modifier onlyActive() {
        require(active == true, "can only be used when the contract is active");
        _;
    }

    modifier onlyNotActive() {
        require(
            active == false,
            "can only be used when the contract is NOT active"
        );
        _;
    }

    /**
     * @dev Defines if initial setup was completed
     * @dev only owner
     * @dev only not active
     */
    function setActivate() external onlyOwner onlyNotActive {
        active = true;
        emit SetActived(owner);
    }

    /**
     * @dev modify threshold and accounts
     * @dev only owner
     * @dev only not active
     * @param addrs_to_add accounts to be added
     * @param addrs_to_del accounts to be removed
     * @param new_threshold defines minimum number of accounts required to manage the accounts list.
     *  For the safety reasons threshold value can never be lower then ceiling(count / 2) + 1.
     *  If any of the values is not set then it should remain unmodified
     */
    function setChange(
        address[] calldata addrs_to_add,
        address[] calldata addrs_to_del,
        uint256 new_threshold
    ) external onlyOwner onlyNotActive {
        for (uint256 i = 0; i < addrs_to_add.length; i++) {
            address addr = addrs_to_add[i];
            if (whitelisted[addr] == false) {
                whitelisted[addr] = true;
                count += 1;
            }
        }

        for (uint256 i = 0; i < addrs_to_del.length; i++) {
            address addr = addrs_to_del[i];
            if (whitelisted[addr] == true) {
                whitelisted[addr] = false;
                count -= 1;
            }
        }

        if (new_threshold < (count / 2 + 1)) {
            revert NotEnoughThreshold(new_threshold, count);
        }
        // require(new_threshold >= (count / 2 + 1), "threshold value can never be lower then ceiling(count / 2) + 1");

        threshold = new_threshold;

        emit SetChanged(threshold, count);
    }
}
