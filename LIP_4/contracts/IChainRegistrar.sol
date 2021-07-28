//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";

interface IChainRegistrar {
    function isXARC2() external view returns (bool);

    function getControllerFromBankAddress(address bank)
        external
        view
        returns (address);

    function registerChain(
        string memory chainid,
        address controller,
        address bank
    ) external;

    function proposeChange(
        string memory chainid,
        address controller,
        address bank
    ) external;

    function approveProposal(uint256 proposal_index) external;
}
