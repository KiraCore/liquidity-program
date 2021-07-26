//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";

// For the safety reasons threshold value can never be lower then ceiling(count / 2) + 1.
error NotEnoughThreshold(uint256 threshold, uint256 total_count);

contract ControllerRegistrar {
    bool public active; // defines if initial setup was completed
    uint256 public threshold; // the M count from the M/N parameter
    uint256 public count; // the N count, always equal to number of accounts
    address public owner; // initial deployer of the contract
    mapping(address => bool) public whitelisted; // whitelisted accounts taking part in the consensus

    struct Proposal {
        address[] addrs_to_add;
        address[] addrs_to_del;
        uint256 new_threshold;
        uint256 approve_count;
    }

    mapping(address => mapping(uint256 => bool)) public approved;

    Proposal[] public proposals;
    uint256 public executed_proposal_index = 0;

    // Events
    event SetActived(address _owner);
    event SetChanged(uint256 _threshold, uint256 _count);
    event ProposedChange(uint256 _proposal_index);
    event ApprovedProposal(uint256 _proposal_index, address _by);
    event ExecutedProposal(uint256 _proposal_index);

    constructor() {
        owner = msg.sender;
        // TODO
        // [ ] do we need to add owner as a controller initially?

        active = false;
        threshold = 1;
        count = 1;
        whitelisted[owner] = true;

        Proposal memory root_proposal = Proposal(
            new address[](0),
            new address[](0),
            1,
            0
        );
        proposals.push(root_proposal);
        proposals[0].addrs_to_add.push(msg.sender);
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

    modifier onlyController() {
        require(
            whitelisted[msg.sender] == true,
            "Only controller can call this"
        );
        _;
    }

    // view functions
    function isActive() external view returns (bool) {
        return active;
    }

    function getOwner() external view returns (address) {
        return owner;
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
     * @dev internal function that tries to apply changes
     *
     *  For the safety reasons threshold value can never be lower then ceiling(count / 2) + 1.
     *  If any of the values is not set then it should remain unmodified
     */
    function applyChange(
        address[] memory addrs_to_add,
        address[] memory addrs_to_del,
        uint256 new_threshold
    ) internal returns (bool) {
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
            return false;
        }

        threshold = new_threshold;
        return true;
    }

    /**
     * @dev modify threshold and accounts
     * @dev only owner
     * @dev only not active
     * @param addrs_to_add accounts to be added
     * @param addrs_to_del accounts to be removed
     * @param new_threshold defines minimum number of accounts required to manage the accounts list.
     */
    function setChange(
        address[] calldata addrs_to_add,
        address[] calldata addrs_to_del,
        uint256 new_threshold
    ) external onlyOwner onlyNotActive {
        // TODO
        // [ ] new_threshold should be optional

        bool applied = applyChange(addrs_to_add, addrs_to_del, new_threshold);

        if (applied == false) {
            revert NotEnoughThreshold(new_threshold, count);
        }

        emit SetChanged(threshold, count);
    }

    /**
     * @dev add a proposal by a controller
     * @dev only controller
     * @dev only active
     * @param addrs_to_add accounts to be added
     * @param addrs_to_del accounts to be removed
     * @param new_threshold defines minimum number of accounts required to manage the accounts list.
     *
     *  Proposal passes and changes are applied only if approveProposal tx was submitted by no less then treshold number of accounts.
     *  If proposal passes then changes are applied and all proposals older then the one that passed should be cancelled/rejected.
     *  If any of the values is not set then it should remain unmodified.
     */
    function proposeChange(
        address[] calldata addrs_to_add,
        address[] calldata addrs_to_del,
        uint256 new_threshold
    ) external onlyController onlyActive {
        require(new_threshold > 0, "threshold should be greater than 0");

        uint256 index = proposals.length;
        proposals.push(
            Proposal({
                addrs_to_add: addrs_to_add,
                addrs_to_del: addrs_to_del,
                new_threshold: new_threshold,
                approve_count: 0
            })
        );

        emit ProposedChange(index);
    }

    /**
     * @dev approve a proposal by a controller
     * @dev only controller
     * @dev only active
     * @param proposal_index index of the proposal
     *
     *  If proposal passes then changes are applied and all proposals older then the one that passed should be cancelled/rejected
     */
    function approveProposal(uint256 proposal_index)
        external
        onlyController
        onlyActive
    {
        require(
            proposal_index > executed_proposal_index,
            "this proposal is cancelled"
        );
        require(proposal_index < proposals.length, "no such proposal exists");
        require(
            approved[msg.sender][proposal_index] == false,
            "proposal already approved by the sender"
        );

        Proposal memory proposal = proposals[proposal_index];

        approved[msg.sender][proposal_index] = true;
        proposals[proposal_index].approve_count += 1;

        if (proposal.approve_count + 1 >= proposal.new_threshold) {
            bool applied = applyChange(
                proposal.addrs_to_add,
                proposal.addrs_to_del,
                proposal.new_threshold
            );
            if (applied == false) {
                revert NotEnoughThreshold(proposal.new_threshold, count);
            }

            executed_proposal_index = proposal_index;
            emit ExecutedProposal(proposal_index);
        }

        emit ApprovedProposal(proposal_index, msg.sender);
    }
}
