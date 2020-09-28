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
        bool withdraw; // if withdraw is allowed
        bool deposit; // if deposit is allowed
    }

    // represents if the address is whitelisted or not
    mapping(address => WhitelistInfo) private _whitelist;

    // Events
    event WhitelistConfigured(address[] addrs, bool withdraw, bool deposit);

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor() public Ownable() ERC20(NAME, SYMBOL) {
        _setupDecimals(DECIMALS);
        _mint(msg.sender, INITIAL_SUPPLY);
        emit Transfer(address(0x0), msg.sender, INITIAL_SUPPLY);
        freezed = true;
        _whitelist[msg.sender].withdraw = true;
        _whitelist[msg.sender].deposit = true;
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
     * @param withdraw boolean variable to indicate if withdraw is allowed
     * @param deposit boolean variable to indicate if deposit is allowed
     */
    function whitelist(
        address[] calldata addrs,
        bool withdraw,
        bool deposit
    ) external onlyOwner returns (bool) {
        for (uint256 i = 0; i < addrs.length; i++) {
            address addr = addrs[i];
            require(addr != owner(), "KEX: can not configure owner's whitelist");
            require(addr != address(0), 'KEX: address should not be zero');

            _whitelist[addr].withdraw = withdraw;
            _whitelist[addr].deposit = deposit;
        }

        emit WhitelistConfigured(addrs, withdraw, deposit);

        return true;
    }

    function transferMultiple(address[] calldata addrs, uint256 amount) external returns (bool) {
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
    function whitelisted(address addr) public view returns (bool, bool) {
        return (_whitelist[addr].withdraw, _whitelist[addr].deposit);
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
        require(!freezed || (_whitelist[from].withdraw && _whitelist[to].deposit), 'KEX: token transfer while freezed and not whitelisted.');
    }
}
