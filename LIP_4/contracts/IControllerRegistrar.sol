//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";

interface IControllerRegistrar {
    function isActive() external view returns (bool);

    function getThreshold() external view returns (uint256);

    function getOwner() external view returns (address);

    function isWhitelisted(address account) external view returns (bool);

    function setActivate() external;

    function setChange(
        address[] calldata addrs_to_add,
        address[] calldata addrs_to_del,
        uint256 new_threshold
    ) external;

    function proposeChange(
        address[] calldata addrs_to_add,
        address[] calldata addrs_to_del,
        uint256 new_threshold
    ) external;

    function approveProposal(uint256 proposal_index) external;
}
