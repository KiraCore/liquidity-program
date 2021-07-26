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

    struct Proposal {
        string chainid;
        address controller;
        address bank;
        uint256 approve_count;
    }

    mapping(address => mapping(uint256 => bool)) public approved;

    Proposal[] public proposals;
    uint256 public executed_proposal_index = 0;

    // Events
    event RegisteredChain(string chainid);
    event ProposedChange(uint256 _proposal_index);
    event ApprovedProposal(uint256 _proposal_index, address _by);
    event ExecutedProposal(uint256 _proposal_index);

    constructor() {
        Proposal memory root_proposal = Proposal("", address(0), address(0), 0);
        proposals.push(root_proposal);
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

    /**
     * @dev add a proposal by one of XARC-1 controllers
     * @dev only XARC-1 controller
     * @dev only XARC-1 is active
     * @param chainid chain id
     * @param controller XARC-1 contract address
     * @param bank XARC-3 contract address
     *
     *  Proposal to change XARC-1 and/or XARC-3 contracts, proposal can be raised by any account in the XARC-1 accounts list.
     *  This function can only be used when the XARC-1 contract is active.
     *  Proposal passes and changes are applied only if approveProposal tx was submitted by no less then XARC-1 treshold number of accounts.
     *  If proposal passes then changes are applied and all proposals associated with the chain-id older then the one that passed should be cancelled/rejected.
     */
    function proposeChange(
        string memory chainid,
        address controller,
        address bank
    ) external {
        require(controller != address(0), "controller address should not be 0");
        require(bank != address(0), "bank address should not be 0");
        require(bytes(chainid).length > 0, "chainid should not be empty");
        require(
            chains[chainid].registered == true,
            "the chain was not registered before"
        );

        IControllerRegistrar XARC_1 = IControllerRegistrar(
            chains[chainid].controller
        );

        bool isActived = XARC_1.isActive();
        require(isActived == true, "XARC-1 should be active");

        bool isWhitelisted = XARC_1.isWhitelisted(msg.sender);
        require(
            isWhitelisted == true,
            "proposal can only be raised by one of the XARC-1 accounts list"
        );

        uint256 index = proposals.length;
        proposals.push(
            Proposal({
                chainid: chainid,
                controller: controller,
                bank: bank,
                approve_count: 0
            })
        );

        emit ProposedChange(index);
    }

    /**
     * @dev approve a proposal by one of XARC-1 controllers
     * @dev only XARC-1 controller
     * @dev only XARC-1 is active
     * @param proposal_index index of the proposal
     *
     *  Proposal passes and changes are applied only if approveProposal tx was submitted by no less then XARC-1 treshold number of accounts.
     *  If proposal passes then changes are applied and all proposals associated with the chain-id older then the one that passed should be cancelled/rejected.
     */
    function approveProposal(uint256 proposal_index) external {
        require(
            proposal_index > executed_proposal_index,
            "this proposal was cancelled"
        );
        require(proposal_index < proposals.length, "no such proposal exists");
        require(
            approved[msg.sender][proposal_index] == false,
            "proposal already approved by the sender"
        );

        Proposal memory proposal = proposals[proposal_index];
        address original_controller = chains[proposal.chainid].controller;

        IControllerRegistrar XARC_1 = IControllerRegistrar(original_controller);

        bool isActived = XARC_1.isActive();
        require(isActived == true, "XARC-1 should be active");

        bool isWhitelisted = XARC_1.isWhitelisted(msg.sender);
        require(
            isWhitelisted == true,
            "proposal can only be approved by one of the XARC-1 accounts list"
        );

        uint256 threshold = XARC_1.getThreshold();

        approved[msg.sender][proposal_index] = true;
        proposals[proposal_index].approve_count += 1;

        if (proposal.approve_count + 1 >= threshold) {
            chains[proposal.chainid] = Chain({
                controller: proposal.controller,
                bank: proposal.bank,
                registered: true
            });

            executed_proposal_index = proposal_index;
            emit ExecutedProposal(proposal_index);
        }

        emit ApprovedProposal(proposal_index, msg.sender);
    }
}
