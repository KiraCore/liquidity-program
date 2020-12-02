pragma solidity 0.6.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/access/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * @title KiraToken
 * @dev Simple ERC20 Token with freezing and whitelist feature.
 */

contract KiraToken is ERC20, Ownable {
    using SafeMath for uint256;

    // modify token name
    string public constant NAME = 'KIRA Network';
    // modify token symbol
    string public constant SYMBOL = 'KEX';
    // modify token decimals
    uint8 public constant DECIMALS = 6;
    // modify initial token supply
    uint256 public constant INITIAL_SUPPLY = 300000000 * (10**uint256(DECIMALS)); // 300,000,000 tokens

    // indicate if the token is freezed or not
    bool public freezed;

    struct WhitelistInfo {
        // if account has allow deposit permission then it should be possible to deposit tokens to that account
        // as long as accounts depositing have allow_transfer permission
        bool allow_deposit;
        // if account has allow transfer permission then that account should be able to transfer tokens to other
        // accounts with allow_deposit permission
        bool allow_transfer;
        // deposit to the account should be possible even if account depositing has no permission to transfer
        bool allow_unconditional_deposit;
        // transfer from the account should be possible to any account even if the destination account has no
        // deposit permission
        bool allow_unconditional_transfer;
    }

    // represents if the address is blacklisted with the contract. Blacklist takes priority before all other permissions like whitelist
    mapping(address => bool) private _blacklist;

    // represents if the address is whitelisted or not
    mapping(address => WhitelistInfo) private _whitelist;

    // Events
    event WhitelistConfigured(
        address[] addrs,
        bool allow_deposit,
        bool allow_transfer,
        bool allow_unconditional_deposit,
        bool allow_unconditional_transfer
    );
    event AddedToBlacklist(address[] addrs);
    event RemovedFromBlacklist(address[] addrs);

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor() public Ownable() ERC20(NAME, SYMBOL) {
        _setupDecimals(DECIMALS);
        _mint(msg.sender, INITIAL_SUPPLY);
        freezed = true;

        // owner's whitelist
        _whitelist[msg.sender].allow_deposit = true;
        _whitelist[msg.sender].allow_transfer = true;
        _whitelist[msg.sender].allow_unconditional_deposit = true;
        _whitelist[msg.sender].allow_unconditional_transfer = true;
    }

    /**
     * @dev freeze and unfreeze functions
     */
    function freeze() external onlyOwner {
        require(freezed == false, 'KEX: already freezed');
        freezed = true;
    }

    function unfreeze() external onlyOwner {
        require(freezed == true, 'KEX: already unfreezed');
        freezed = false;
    }

    /**
     * @dev configure whitelist to an address
     * @param addrs the addresses to be whitelisted
     * @param allow_deposit boolean variable to indicate if deposit is allowed
     * @param allow_transfer boolean variable to indicate if transfer is allowed
     * @param allow_unconditional_deposit boolean variable to indicate if unconditional deposit is allowed
     * @param allow_unconditional_transfer boolean variable to indicate if unconditional transfer is allowed
     */
    function whitelist(
        address[] calldata addrs,
        bool allow_deposit,
        bool allow_transfer,
        bool allow_unconditional_deposit,
        bool allow_unconditional_transfer
    ) external onlyOwner returns (bool) {
        for (uint256 i = 0; i < addrs.length; i++) {
            address addr = addrs[i];
            require(addr != address(0), 'KEX: address should not be zero');

            _whitelist[addr].allow_deposit = allow_deposit;
            _whitelist[addr].allow_transfer = allow_transfer;
            _whitelist[addr].allow_unconditional_deposit = allow_unconditional_deposit;
            _whitelist[addr].allow_unconditional_transfer = allow_unconditional_transfer;
        }

        emit WhitelistConfigured(addrs, allow_deposit, allow_transfer, allow_unconditional_deposit, allow_unconditional_transfer);

        return true;
    }

    /**
     * @dev add addresses to blacklist
     */
    function addToBlacklist(address[] calldata addrs) external onlyOwner returns (bool) {
        for (uint256 i = 0; i < addrs.length; i++) {
            address addr = addrs[i];
            require(addr != address(0), 'KEX: address should not be zero');

            _blacklist[addr] = true;
        }

        emit AddedToBlacklist(addrs);

        return true;
    }

    /**
     * @dev remove addresses from blacklist
     */
    function removeFromBlacklist(address[] calldata addrs) external onlyOwner returns (bool) {
        for (uint256 i = 0; i < addrs.length; i++) {
            address addr = addrs[i];
            require(addr != address(0), 'KEX: address should not be zero');

            _blacklist[addr] = false;
        }

        emit RemovedFromBlacklist(addrs);

        return true;
    }

    function multiTransfer(address[] calldata addrs, uint256 amount) external returns (bool) {
        require(amount > 0, 'KEX: amount should not be zero');
        require(balanceOf(msg.sender) >= amount.mul(addrs.length), 'KEX: amount should be less than the balance of the sender');

        for (uint256 i = 0; i < addrs.length; i++) {
            address addr = addrs[i];
            require(addr != msg.sender, 'KEX: address should not be sender');
            require(addr != address(0), 'KEX: address should not be zero');

            transfer(addr, amount);
        }

        return true;
    }

    /**
     * @dev Returns if the address is whitelisted or not.
     */
    function whitelisted(address addr)
        public
        view
        returns (
            bool,
            bool,
            bool,
            bool
        )
    {
        return (
            _whitelist[addr].allow_deposit,
            _whitelist[addr].allow_transfer,
            _whitelist[addr].allow_unconditional_deposit,
            _whitelist[addr].allow_unconditional_transfer
        );
    }

    /**
     * @dev Returns if the address is on the blacklist or not.
     */
    function blacklisted(address addr) public view returns (bool) {
        return _blacklist[addr];
    }

    /**
     * @dev Hook before transfer
     * check from and to are whitelisted when the token is freezed
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!_blacklist[from], 'KEX: sender is blacklisted.');
        require(!_blacklist[to], 'KEX: receiver is blacklisted.');
        require(
            !freezed ||
                _whitelist[from].allow_unconditional_transfer ||
                _whitelist[to].allow_unconditional_deposit ||
                (_whitelist[from].allow_transfer && _whitelist[to].allow_deposit),
            'KEX: token transfer while freezed and not whitelisted.'
        );
    }
}
