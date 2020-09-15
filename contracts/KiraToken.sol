pragma solidity 0.6.2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title KiraToken
 * @dev Simple ERC20 Token with freezing and whitelist feature.
 */

contract KiraToken is ERC20, Ownable {
    using SafeMath for uint256;

    // modify token name
    string public constant NAME = "KIRA Network";
    // modify token symbol
    string public constant SYMBOL = "KEX";
    // modify token decimals
    uint8 public constant DECIMALS = 6;
    // modify initial token supply
    uint256 public constant INITIAL_SUPPLY = 300000000 *
        (10**uint256(DECIMALS)); // 10000 tokens

    bool public freezed;

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor() public Ownable() ERC20(NAME, SYMBOL) {
        _setupDecimals(DECIMALS);
        _mint(msg.sender, INITIAL_SUPPLY);
        emit Transfer(address(0x0), msg.sender, INITIAL_SUPPLY);
        freezed = false;
    }

    function freeze() external onlyOwner {
        require(freezed == false, "KEX: already freezed");
        freezed = true;
    }

    function unfreeze() external onlyOwner {
        require(freezed == true, "KEX: already unfreezed");
        freezed = false;
    }
}
