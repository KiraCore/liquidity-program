pragma solidity 0.6.2;

import './ERC20.sol';
import 'openzeppelin-solidity/contracts/access/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/math/Math.sol';

interface IUniswapV2Pair {
    function sync() external;
}

interface IUniswapV2Factory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

/**
 * @title KiraDrop
 * @dev Uniswap v2 Liquidity Rewards
 */

contract KiraDrop is ERC20, Ownable {
    using SafeMath for uint256;
    using Math for uint256;

    string public constant NAME = 'KIRA Network'; // modify token name
    string public constant SYMBOL = 'KEX'; // modify token symbol
    uint8 public constant DECIMALS = 6; // modify token decimals
    uint256 public constant INITIAL_SUPPLY = 300000000 * (10**uint256(DECIMALS)); // modify initial token supply // 300,000,000 tokens

    struct ClaimSnapshot {
        uint256 time; // last claim time
        mapping(address => uint256) balances; // balance per token that user provided to the liquidity at the last claim time
        mapping(address => uint256) totalBalances; // total liquidity balance per token at the last claim time
    }

    mapping(address => ClaimSnapshot) private lastClaimByUser; // user's last claim snapshot

    struct RewardInfo {
        uint256 X; // amount of token to distribute every T period
        uint256 T; // period of time (hr) for distributing X KEX
        uint256 maxT; // maximum limit of period
        uint256 index; // index of pairTokenAddresses
        bool exists; // indicate if the pair is configured
    }

    mapping(address => RewardInfo) private pairTokens; // array of pair token reward information
    address[] private pairTokenAddresses; // array of pair token addresses

    address public rewardPool;
    IUniswapV2Factory public uniswapFactory = IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor() public Ownable() ERC20(NAME, SYMBOL) {
        _setupDecimals(DECIMALS);
        _mint(msg.sender, INITIAL_SUPPLY);
        emit Transfer(address(0x0), msg.sender, INITIAL_SUPPLY);
    }

    function setRewardPool(address _rewardPool) external onlyOwner {
        require(rewardPool == address(0), 'KiraDrop: reward pool already created');
        rewardPool = _rewardPool;
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
        require(tokenAddr != address(0), 'KiraDrop: token address can not be zero');
        require(pairTokens[tokenAddr].exists != true, 'KiraDrop: this token is already configured. If you want to update, call updatePairToken.');
        require(X > 0 && T > 0, 'KiraDrop: should be valid configuration');

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
        require(tokenAddr != address(0), 'KiraDrop: token address can not be zero');
        require(pairTokens[tokenAddr].exists == true, 'KiraDrop: no such token configured. If you want to add, call addPairToken.');
        require(X > 0 && T > 0, 'KiraDrop: should be valid configuration');

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
        require(tokenAddr != address(0), 'KiraDrop: token address can not be zero');
        require(pairTokens[tokenAddr].exists == true, 'KiraDrop: no such token configured. If you want to add, call addPairToken.');

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

    /**
     * @dev token claimed by user
     *
     */
    function claimRewards() external {
        require(rewardPool != address(0), 'KiraDrop: reward pool is not initialized');
        require(balanceOf(rewardPool) > 0, 'KiraDrop: reward pool is empty');

        uint256 nPairs = pairTokenAddresses.length;
        uint256 rewardAmount = 0;

        for (uint256 i = 0; i < nPairs; i++) {
            address addr = pairTokenAddresses[i];
            RewardInfo memory info = pairTokens[addr];

            address lpTokenAddr = pairFor(address(uniswapFactory), address(this), addr);
            if (lpTokenAddr != address(0)) {
                IERC20 lpToken = IERC20(lpTokenAddr);

                uint256 currentBalanceOfUser = lpToken.balanceOf(msg.sender);
                uint256 currentTotalBalance = lpToken.totalSupply();

                uint256 minBalanceOfUser = currentBalanceOfUser.min(lastClaimByUser[msg.sender].balances[addr]);
                uint256 minTotalBalance = currentTotalBalance.min(lastClaimByUser[msg.sender].totalBalances[addr]);

                if (minTotalBalance > 0 && minBalanceOfUser > 0) {
                    uint256 passedTime = info.maxT.min(now - lastClaimByUser[msg.sender].time);
                    uint256 totalDistribute = info.X.mul(passedTime).div(info.T).div(1 hours);
                    uint256 proportion = totalDistribute.mul(minBalanceOfUser).div(minTotalBalance);

                    rewardAmount = rewardAmount.add(proportion);
                }

                lastClaimByUser[msg.sender].balances[addr] = currentBalanceOfUser;
                lastClaimByUser[msg.sender].totalBalances[addr] = currentTotalBalance;
            }
        }

        require(rewardAmount > 0, 'KiraDrop: no rewards available for you.');
        rewardAmount = rewardAmount.min(balanceOf(rewardPool));

        _balances[rewardPool] = _balances[rewardPool].sub(rewardAmount);

        _balances[msg.sender] = _balances[msg.sender].add(rewardAmount);
        emit Transfer(rewardPool, msg.sender, rewardAmount);

        lastClaimByUser[msg.sender].time = now;
    }

    // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, 'UniswapV2Library: IDENTICAL_ADDRESSES');
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'UniswapV2Library: ZERO_ADDRESS');
    }

    // calculates the CREATE2 address for a pair without making any external calls
    function pairFor(
        address factory,
        address tokenA,
        address tokenB
    ) internal pure returns (address pair) {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        pair = address(
            uint256(
                keccak256(
                    abi.encodePacked(
                        hex'ff',
                        factory,
                        keccak256(abi.encodePacked(token0, token1)),
                        hex'96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' // init code hash
                    )
                )
            )
        );
    }
}
