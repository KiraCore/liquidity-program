pragma solidity 0.6.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/access/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

interface IUniswapV2Pair {
    function sync() external;
}

interface IUniswapV2Factory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

/**
 * @title KiraToken
 * @dev Simple ERC20 Token with freezing and whitelist feature.
 */

contract KiraToken is ERC20, Ownable {
    using SafeMath for uint256;

    // LIP_1

    string public constant NAME = 'KIRA Network'; // modify token name
    string public constant SYMBOL = 'KEX'; // modify token symbol
    uint8 public constant DECIMALS = 6; // modify token decimals
    uint256 public constant INITIAL_SUPPLY = 300000000 * (10**uint256(DECIMALS)); // modify initial token supply // 300,000,000 tokens

    bool public freezed; // indicate if the token is freezed or not
    mapping(address => bool) private _whitelist; // represents if the address is whitelisted or not

    // LIP_2

    struct ClaimSnapshot {
        uint256 time; // last claim time
        mapping(address => uint256) balances; // balance per token that user provided to the liquidity at the last claim time
        mapping(address => uint256) totalBalances; // total liquidity balance per token at the last claim time
    }

    struct User {
        mapping(address => uint256) balances; // e.g (balances[ETH.address]: amount of ETH that user provides to liquidity)
        ClaimSnapshot lastClaimSnapshot; // user's last claim snapshot
    }

    mapping(address => User) private user;

    struct RewardInfo {
        uint256 X; // amount of token to distribute every T period
        uint256 T; // period of time (hr) for distributing X KEX
        uint256 maxT; // maximum limit of period
        uint256 index; // index of pairTokenAddresses
        bool exists; // indicate if the pair is configured
    }

    mapping(address => RewardInfo) private pairTokens; // array of pair token reward information
    address[] private pairTokenAddresses; // array of pair token addresses

    // Events
    event AddressWhitelisted(address addr);
    event AddressWhitelistRemoved(address addr);

    // Modifiers
    modifier whenNotFreezed() {
        require(freezed == false, 'KEX: token is freezed');
        _;
    }

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

    /**
     * @dev add token pair for distributing X KEX, every T (limit: maxT)
     *
     * @param tokenAddr address of the token which will be paired with KEX
     * @param X amount of token to distribute every T period
     * @param T period of time (hr) for distributing X KEX
     * @param maxT maximum limit of period
     */
    function addPairToken(
        address tokenAddr,
        uint256 X,
        uint256 T,
        uint256 maxT
    ) external onlyOwner {
        require(tokenAddr != address(0), 'KEX: token address can not be zero');
        require(pairTokens[tokenAddr].exists != true, 'KEX: this token is already configured. If you want to update, call updatePairToken.');

        pairTokenAddresses.push(tokenAddr);
        pairTokens[tokenAddr] = RewardInfo({X: X, T: T, maxT: maxT, index: pairTokenAddresses.length - 1, exists: true});
    }

    /**
     * @dev update token pair Reward Info
     *
     * @param tokenAddr address of the token which will be paired with KEX
     * @param X amount of token to distribute every T period
     * @param T period of time (hr) for distributing X KEX
     * @param maxT maximum limit of period
     */
    function updatePairToken(
        address tokenAddr,
        uint256 X,
        uint256 T,
        uint256 maxT
    ) external onlyOwner {
        require(tokenAddr != address(0), 'KEX: token address can not be zero');
        require(pairTokens[tokenAddr].exists == true, 'KEX: no such token configured. If you want to add, call addPairToken.');

        pairTokens[tokenAddr].X = X;
        pairTokens[tokenAddr].T = T;
        pairTokens[tokenAddr].maxT = maxT;
    }

    /**
     * @dev remove token pair
     *
     * @param tokenAddr address of the token which will be paired with KEX
     */
    function removePairToken(address tokenAddr) external onlyOwner {
        require(tokenAddr != address(0), 'KEX: token address can not be zero');
        require(pairTokens[tokenAddr].exists == true, 'KEX: no such token configured. If you want to add, call addPairToken.');

        uint256 removeIndex = pairTokens[tokenAddr].index;
        uint256 totalCount = pairTokenAddresses.length;
        address lastAddress = pairTokenAddresses[pairTokenAddresses.length - 1];

        /*
            pairTokenAddresses
                index:  (0) - (1) - ... - (removeIndex)  - ... - (totalCount - 1)
                origin:  *  -  *  - ... -  [tokenAddr]   - ... - [lastAddress]
                new:     *  -  *  - ... - [lastAddress]  - ... -
        */

        // if index is not the last entry
        if (removeIndex != totalCount - 1) {
            pairTokenAddresses[removeIndex] = lastAddress;
            pairTokens[lastAddress].index = removeIndex;
        }
        delete pairTokens[tokenAddr];
        delete pairTokenAddresses[totalCount - 1];
    }

    function getPairAddresses() public view returns (address[] memory) {
        return pairTokenAddresses;
    }

    function getTotalPairs() public view returns (uint256) {
        return pairTokenAddresses.length;
    }

    function getRewardInfo(address addr)
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            bool
        )
    {
        return (pairTokens[addr].index, pairTokens[addr].X, pairTokens[addr].T, pairTokens[addr].maxT, pairTokens[addr].exists);
    }

    function claimRewards() external whenNotFreezed {}
}
