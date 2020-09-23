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
    // represents if the address is whitelisted or not
    mapping(address => bool) private _whitelist;

    // Events
    event AddressWhitelisted(address addr);
    event AddressWhitelistRemoved(address addr);

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor() public Ownable() ERC20(NAME, SYMBOL) {
        _setupDecimals(DECIMALS);
        _mint(msg.sender, INITIAL_SUPPLY);
        emit Transfer(address(0x0), msg.sender, INITIAL_SUPPLY);
        freezed = true;
        _whitelist[msg.sender] = true;
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
     * @dev add an address to whitelist
     */
    function whitelistAdd(address addr) external onlyOwner returns (bool) {
        _whitelist[addr] = true;
        emit AddressWhitelisted(addr);
        return true;
    }

    /**
     * @dev remove an address from whitelist
     * owner can not be removed from whitelist
     * can not remote an addres which is not whitelisted
     */
    function whitelistRemove(address addr) external onlyOwner returns (bool) {
        require(addr != owner(), "KEX: can not remove owner's whitelist");
        require(_whitelist[addr] == true, 'KEX: the address is not whitelisted');
        _whitelist[addr] = false;
        emit AddressWhitelistRemoved(addr);
        return true;
    }

    /**
     * @dev Returns if the address is whitelisted or not.
     */
    function whitelisted(address addr) public view returns (bool) {
        return _whitelist[addr];
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
        require(!freezed || (_whitelist[from] && _whitelist[to]), 'KEX: token transfer while freezed and not whitelisted.');
    }
}
