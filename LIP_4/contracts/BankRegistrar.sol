//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./IControllerRegistrar.sol";
import "./IChainRegistrar.sol";

contract BankRegistrar {
    // Withdraw and deposits can have following status codes:
    enum TransferStatus {
        Pending,
        Accpeted,
        Rejected
    }

    bool public active; // defines if initial setup was completed
    address public owner; // initial deployer of the contract

    address xarc2; // must be a valid XARC-2 contract address
    address xarc1; // must be a valid XARC-1 contract address. this address is queried based on xarc2
    uint256 deposit_fee; // minimum fee that must be paid to deposit
    uint256 withdraw_fee; // minimum fee that must be paid to withdraw
    uint256 proposer_reward; // reward for proposing withdraws/deposits
    uint256 confirmations; // minimum number of confirmations required

    bool freeze_deposit; // enable/disable deposits
    bool freeze_withdraw; // enable/disable withdraws

    struct Proposal {
        address xarc2;
        uint256 deposit_fee;
        uint256 withdraw_fee;
        uint256 proposer_reward;
        uint256 confirmations;
        bool freeze_deposit;
        bool freeze_withdraw;
        uint256 approve_count;
    }

    mapping(address => mapping(uint256 => bool)) public approved;

    Proposal[] public proposals;
    uint256 public executed_proposal_index = 0;

    // Events
    event SetActived(address _owner);
    event SetChanged(
        address,
        address,
        uint256,
        uint256,
        uint256,
        uint256,
        bool,
        bool
    );
    event ProposedChange(uint256 _proposal_index);
    event ApprovedProposal(uint256 _proposal_index, address _by);
    event ExecutedProposal(uint256 _proposal_index);

    constructor() {
        owner = msg.sender;
        Proposal memory root_proposal = Proposal(
            address(0),
            0,
            0,
            0,
            0,
            false,
            false,
            0
        );
        proposals.push(root_proposal);
    }

    // modifiers
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

    modifier onlyActiveController() {
        require(
            xarc1 != address(0),
            "XARC1 contract address should not be zero"
        );
        IControllerRegistrar controller_registrar = IControllerRegistrar(xarc1);

        bool isActive = controller_registrar.isActive();
        require(isActive == true, "XARC1 contract should be active");

        bool isWhitelisted = controller_registrar.isWhitelisted(msg.sender);
        require(
            isWhitelisted == true,
            "can only be called from one of the XARC-1 controllers"
        );
        _;
    }

    modifier onlyValidXARC2(address _registrar) {
        require(
            _registrar != address(0),
            "XARC2 contract address should not be zero"
        );
        IChainRegistrar chain_registrar = IChainRegistrar(_registrar);
        bool isXARC2 = chain_registrar.isXARC2();
        require(isXARC2 == true, "XARC2 contract address is invalid");
        _;
    }

    // internal functions

    /**
     * @dev we assume _registrar is a valid XARC2 address
     * @param _registrar a valid XARC-2 contract address
     */
    function getXARC1(address _registrar) internal view returns (address) {
        IChainRegistrar chain_registrar = IChainRegistrar(_registrar);
        address _xarc1 = chain_registrar.getControllerFromBankAddress(
            address(this)
        );
        require(
            _xarc1 != address(0),
            "XARC1 contract address should not be zero"
        );
        return _xarc1;
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
     * @dev Defines cross-chain registrar address, fees, proposer rewards and token transfers freeze properties
     * @dev only owner
     * @dev only not active
     * @param _registrar XARC-2 contract address
     * @param _deposit_fee minimum fee that must be paid to deposit
     * @param _withdraw_fee minimum fee that must be paid to withdraw
     * @param _proposer_reward reward for proposing withdraws/deposits
     * @param _confirmations minimum number of confirmations required
     * @param _freeze_deposit enable/disable deposits
     * @param _freeze_withdraw enable/disable withdraw
     */
    function setChange(
        address _registrar,
        uint256 _deposit_fee,
        uint256 _withdraw_fee,
        uint256 _proposer_reward,
        uint256 _confirmations,
        bool _freeze_deposit,
        bool _freeze_withdraw
    ) external onlyOwner onlyNotActive onlyValidXARC2(_registrar) {
        // TODO
        // [ ] all input values are optional

        xarc2 = _registrar;
        xarc1 = getXARC1(xarc2);
        deposit_fee = _deposit_fee;
        withdraw_fee = _withdraw_fee;
        proposer_reward = _proposer_reward;
        confirmations = _confirmations;
        freeze_deposit = _freeze_deposit;
        freeze_withdraw = _freeze_withdraw;

        emit SetChanged(
            xarc2,
            xarc1,
            deposit_fee,
            withdraw_fee,
            proposer_reward,
            confirmations,
            freeze_deposit,
            freeze_withdraw
        );
    }

    /**
     * @dev add a proposal by a controller
     * @dev only active
     * @dev only one of XARC-1 controllers
     * @dev only XARC-1 is active
     */
    function proposeChange(
        address _registrar,
        uint256 _deposit_fee,
        uint256 _withdraw_fee,
        uint256 _proposer_reward,
        uint256 _confirmations,
        bool _freeze_deposit,
        bool _freeze_withdraw
    ) external onlyActive onlyActiveController {
        // TODO
        // [ ] all input values are optional
        require(
            _registrar != address(0),
            "XARC2 contract address should not be zero"
        );
        IChainRegistrar chain_registrar = IChainRegistrar(_registrar);
        bool isXARC2 = chain_registrar.isXARC2();
        require(isXARC2 == true, "XARC2 contract address is invalid");

        uint256 index = proposals.length;
        proposals.push(
            Proposal({
                xarc2: _registrar,
                deposit_fee: _deposit_fee,
                withdraw_fee: _withdraw_fee,
                proposer_reward: _proposer_reward,
                confirmations: _confirmations,
                freeze_deposit: _freeze_deposit,
                freeze_withdraw: _freeze_withdraw,
                approve_count: 0
            })
        );

        emit ProposedChange(index);
    }

    /**
     * @dev approve a proposal by one of XARC-1 controllers
     * @dev only active
     * @dev only XARC-1 controller
     * @dev only XARC-1 is active
     * @param proposal_index index of the proposal
     *
     */
    function approveProposal(uint256 proposal_index)
        external
        onlyActive
        onlyActiveController
    {
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
        approved[msg.sender][proposal_index] = true;
        proposals[proposal_index].approve_count += 1;

        IControllerRegistrar controller_registrar = IControllerRegistrar(xarc1);
        uint256 threshold = controller_registrar.getThreshold();

        emit ApprovedProposal(proposal_index, msg.sender);

        if (proposal.approve_count + 1 >= threshold) {
            xarc2 = proposal.xarc2;
            xarc1 = getXARC1(xarc2);
            deposit_fee = proposal.deposit_fee;
            withdraw_fee = proposal.withdraw_fee;
            proposer_reward = proposal.proposer_reward;
            confirmations = proposal.confirmations;
            freeze_deposit = proposal.freeze_deposit;
            freeze_withdraw = proposal.freeze_withdraw;

            executed_proposal_index = proposal_index;
            emit ExecutedProposal(proposal_index);
        }
    }
}
