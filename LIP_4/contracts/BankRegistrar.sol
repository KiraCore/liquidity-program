//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";
import "./IControllerRegistrar.sol";
import "./IChainRegistrar.sol";

contract BankRegistrar is ERC1155 {
    using SafeMath for uint256;

    // Withdraw and deposits can have following status codes:
    enum TransferStatus {
        Pending,
        Accepted,
        Rejected
    }

    enum ProposalType {
        Change,
        Deposit,
        Withdraw
    }

    struct Settings {
        address xarc2; // must be a valid XARC-2 contract address
        address xarc1; // must be a valid XARC-1 contract address. this address is queried based on xarc2
        uint256 deposit_fee; // minimum fee  that must be paid to deposit
        uint256 withdraw_fee; // minimum fee that must be paid to withdraw
        uint256 proposer_reward; // reward for proposing withdraws/deposits
        uint256 confirmations; // minimum number of confirmations required
        bool freeze_deposit; // enable/disable deposits
        bool freeze_withdraw; // enable/disable withdraws
    }

    struct Order {
        address user;
        uint256 amount;
        address token_addr;
        uint256 block_number;
        TransferStatus status;
    }

    struct Proposal {
        ProposalType ptype;
        Settings settings;
        uint256[] accept;
        uint256[] reject;
        uint256 approve_count;
    }

    bool public active; // defines if initial setup was completed
    address public owner; // initial deployer of the contract
    Settings public settings;

    Order[] public deposits;
    uint256 public executed_deposit_index = 0;
    Order[] public withdraws;
    uint256 public executed_withdraw_index = 0;

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

    constructor() ERC1155("") {
        owner = msg.sender;
        uint256[] memory empty;
        Proposal memory root_proposal = Proposal(
            ProposalType.Change,
            Settings(address(0), address(0), 0, 0, 0, 0, false, false),
            empty,
            empty,
            0
        );
        proposals.push(root_proposal);
        Order memory deposit = Order(
            address(0),
            0,
            address(0),
            0,
            TransferStatus.Pending
        );
        deposits.push(deposit);
        Order memory withdraw = Order(
            address(0),
            0,
            address(0),
            0,
            TransferStatus.Pending
        );
        withdraws.push(withdraw);
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
            settings.xarc1 != address(0),
            "XARC1 contract address should not be zero"
        );
        IControllerRegistrar controller_registrar = IControllerRegistrar(
            settings.xarc1
        );

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

        address xarc1 = getXARC1(_registrar);

        settings = Settings(
            _registrar,
            xarc1,
            _deposit_fee,
            _withdraw_fee,
            _proposer_reward,
            _confirmations,
            _freeze_deposit,
            _freeze_withdraw
        );

        emit SetChanged(
            _registrar,
            xarc1,
            _deposit_fee,
            _withdraw_fee,
            _proposer_reward,
            _confirmations,
            _freeze_deposit,
            _freeze_withdraw
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
        Settings memory _settings = Settings(
            _registrar,
            address(0),
            _deposit_fee,
            _withdraw_fee,
            _proposer_reward,
            _confirmations,
            _freeze_deposit,
            _freeze_withdraw
        );
        IChainRegistrar chain_registrar = IChainRegistrar(_registrar);
        bool isXARC2 = chain_registrar.isXARC2();
        require(isXARC2 == true, "XARC2 contract address is invalid");

        uint256 index = proposals.length;
        uint256[] memory empty;
        proposals.push(
            Proposal(ProposalType.Change, _settings, empty, empty, 0)
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

        IControllerRegistrar controller_registrar = IControllerRegistrar(
            settings.xarc1
        );
        uint256 threshold = controller_registrar.getThreshold();

        emit ApprovedProposal(proposal_index, msg.sender);

        if (proposal.approve_count + 1 >= threshold) {
            if (proposal.ptype == ProposalType.Change) {
                settings = proposal.settings;
                settings.xarc1 = getXARC1(settings.xarc2);

                executed_proposal_index = proposal_index;
            } else if (proposal.ptype == ProposalType.Deposit) {
                // do accept and reject for deposits
                // distribute fees
            } else if (proposal.ptype == ProposalType.Withdraw) {
                // do accept and reject for withdraws
                // distribute fees
            }
            emit ExecutedProposal(proposal_index);
        }
    }

    /**
     * @dev Proposal to accept and/or reject deposits
     * @dev only active
     * @dev only XARC-1 controller
     * @dev only XARC-1 is active
     * @param accept array of accepting proposal indexes
     * @param reject array of rejecting proposal indexes
     *
     * Can only be raised for assets deposited at current_block_heigh - confirmations.
     * If passed records are cleared to save space. This proposal can be raised by any account as per XARC-1,
     * proposer receives proposer-reward % of all deposit fees. Remaining fees are split between all who vote on accepting proposal.
     * Proposal must have at least one record present and all deposit proposals older then the accepted one become automatically rejected
     */
    function proposeDeposits(
        uint256[] calldata accept,
        uint256[] calldata reject
    ) external onlyActive onlyActiveController {
        // TODO: check block heights
        // TODO: remove old proposals to save space.
        require(
            accept.length > 0 || reject.length > 0,
            "either accept or reject is required"
        );
        uint256 index = proposals.length;
        proposals.push(
            Proposal(
                ProposalType.Deposit,
                Settings(address(0), address(0), 9, 0, 0, 0, false, false),
                accept,
                reject,
                0
            )
        );
    }

    /**
     * @dev deposit
     * @dev callable by any user
     * @dev requires minimum fee
     * @dev only freeze_deposit is false
     * @param amount the amount of depositing token
     * @param token_addr the address of the depositing token
     */
    function deposit(uint256 amount, address token_addr) public payable {
        require(
            settings.freeze_deposit == false,
            "currently deposit is freezed"
        );
        require(
            msg.value == settings.deposit_fee,
            "should set the correct deposit fee"
        );

        IERC20 token = IERC20(token_addr);
        token.transferFrom(msg.sender, address(this), amount);

        deposits.push(
            Order({
                user: msg.sender,
                token_addr: token_addr,
                amount: amount,
                block_number: block.number,
                status: TransferStatus.Pending
            })
        );
    }

    /**
     * @dev withdraw
     * @dev callable by any user
     * @dev requires minimum fee
     * @dev only freeze_withdraw is false
     * @param amount the amount of withdrawing token
     * @param token_addr the address of the withdrawing token
     */
    function withdraw(uint256 amount, address token_addr) public payable {
        require(
            settings.freeze_withdraw == false,
            "currently withdraw is freezed"
        );
        require(
            msg.value == settings.withdraw_fee,
            "should set the correct withdraw fee"
        );
        IERC20 token = IERC20(token_addr);
        uint256 user_balance = token.balanceOf(address(this));
        require(user_balance >= amount, "not enough locked funds to withdraw");

        withdraws.push(
            Order({
                user: msg.sender,
                token_addr: token_addr,
                amount: amount,
                block_number: block.number,
                status: TransferStatus.Pending
            })
        );
    }

    /**
     * @dev claim transaction can be executed after withdraw status is changed to accepted
     * @param withdraw_index index of the withdraw
     */
    function claim(uint256 withdraw_index) external {
        // TODO user doesn't know the withdraw index
        require(
            (executed_withdraw_index < withdraw_index) &&
                (withdraw_index < withdraws.length),
            "invalid withdraw index"
        );
        Order memory order = withdraws[withdraw_index];
        require(
            order.status != TransferStatus.Rejected,
            "withdraw is rejected"
        );
        require(
            order.status != TransferStatus.Pending,
            "withdraw is not accepted yet"
        );

        uint256 user_balance = balanceOf(
            order.user,
            uint256(uint160(order.token_addr))
        );
        require(
            user_balance >= order.amount,
            "not enough locked funds to claim"
        );

        IERC20 token = IERC20(order.token_addr);
        uint256 total_claimable = token.balanceOf(address(this));
        require(
            total_claimable >= order.amount,
            "not enough funds in the contract"
        );

        _burn(order.user, uint256(uint160(order.token_addr)), order.amount);
        token.transfer(order.user, order.amount);
    }

    /**
     * @dev refund transaction can be executed after deposit status changes to rejected or if transaction is not
     * present in any of the active deposit proposals. If refund is called funds should be returned to the user.
     * @param deposit_index index of the deposit
     */
    function refund(uint256 deposit_index) external {
        // TODO do we need to refund fee?
        require(
            (executed_deposit_index < deposit_index) &&
                (deposit_index < deposits.length),
            "invalid deposit index"
        );
        Order memory order = deposits[deposit_index];

        // TODO: should check if not present in any active proposals
        require(
            order.status == TransferStatus.Rejected,
            "deposit should be rejected or not present in any active proposals"
        );

        // IERC20 token = IERC20(order.token_addr);
        // uint256 user_balance = token.balanceOf(address(this));
        // require(
        //     user_balance >= order.amount,
        //     "not enough locked funds to refund"
        // );

        // IERC20 token = IERC20(order.token_addr);
        // uint256 total_refundable = token.balanceOf(address(this));
        // require(
        //     total_refundable >= order.amount,
        //     "not enough funds in the contract"
        // );

        // _burn(order.user, uint256(uint160(order.token_addr)), order.amount);
        // token.transfer(order.user, order.amount);
    }
}
