//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./IControllerRegistrar.sol";

// error NotEnoughThreshold(uint256 threshold, uint256 total_count);

contract ChainRegistrar {
    struct Chain {
        address controller; // must be a valid XARC-1 contract address
        address bank; // must be a valid XARC-3 contract address
        bool registered;
    }

    mapping(string => Chain) chains;

    // Events
    event RegisteredChain(string chainid);

    constructor() {
        // constructor
    }

    /**
     * @dev Defines XARC-1, XARC-3 contract and chain-id to be registered.
     * @dev Tx can only be submitted by the XARC-1 & XARC-3 owner/deployer when the XARC-1 and XARC-3 is NOT active
     * @param chainid chain id
     * @param controller XARC-1 contract address
     * @param bank XARC-3 contract address
     *
     * The chain-id can never be changed after registration is finalized.
     */
    function registerChain(
        string memory chainid,
        address controller,
        address bank
    ) external {
        require(controller != address(0), "controller address should not be 0");
        require(bank != address(0), "bank address should not be 0");
        require(bytes(chainid).length > 0, "chainid should not be empty");
        require(
            chains[chainid].registered == false,
            "the chain has already registered"
        );

        IControllerRegistrar xarc1_contract = IControllerRegistrar(controller);
        IControllerRegistrar xarc3_contract = IControllerRegistrar(bank);

        bool isXARC1Actived = xarc1_contract.isActive();
        require(isXARC1Actived == false, "XARC-1 should not be active");

        bool isXARC3Actived = xarc3_contract.isActive();
        require(isXARC3Actived == false, "XARC-3 should not be active");

        address xarc1Owner = xarc1_contract.getOwner();
        address xarc3Owner = xarc3_contract.getOwner();
        require(
            msg.sender == xarc1Owner || msg.sender == xarc3Owner,
            "msg.sender should be XARC-1 or XARC-3 owner/deployer"
        );

        chains[chainid] = Chain({
            controller: controller,
            bank: bank,
            registered: true
        });

        emit RegisteredChain(chainid);
    }
}
