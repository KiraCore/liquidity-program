pragma solidity 0.6.2;

import 'openzeppelin-solidity/contracts/token/ERC20/IERC20.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/access/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * @title KiraAuction
 * @dev Liquidity Auction Contract for the final round of the KEX token distribution.
 *
 * The Liquidity Auction works in the similar fashion to the Polkadot Reverse Dutch auction
 * with the difference that in case of oversubscription all tokens that overflowed the hard
 * cap would be used to add liquidity to the uniswap or as MM war chest in case of listing
 * to support price on the market.
 *
 * Reverse Dutch auction starts with a very very high initial valuation that cannot possibly
 * be fulfilled and decreases towards predefined valuation at predefined rate. Auction ends
 * instantly if value of assets deposited is greater or equals to the valuation, or if auction
 * times out.
 */

contract KiraAuction is ERC20, Ownable {
    using SafeMath for uint256;

    uint256 private constant MIN_WEI = 0 ether;

    address payable public wallet;

    uint256 public startTime;
    uint256 private P1; // price of ETH per 1 KEX
    uint256 private P2;
    uint256 private P3;
    uint256 private T1;
    uint256 private T2;

    mapping(address => bool) private whitelisted;
    mapping(address => uint256) private claimed_wei;
    address[] private contributors;

    IERC20 private kiraToken;

    uint256 private totalWeiAmount = 0;

    /*
        status
        0 - before the start
        1 - in the progress (exceed the start time & at least one sends ETH to the contract)
        2 - after the auction end
    */
    uint256 private status = 0;
    bool private isPriceConfigured = false;

    // Events
    event AddedToWhitelist(address addr);

    // Constructor

    constructor(IERC20 _kiraToken) public {
        kiraToken = _kiraToken;
        wallet = msg.sender;
    }

    function setStartTime(uint256 _startTime) external onlyOwner {
        require(status == 0, 'KiraAuction: not be able to set start time because auction is already started.');
        require(isPriceConfigured == false, 'KiraAuction: price should be configured before setting start time.');
        startTime = _startTime;
    }

    function setWallet(address _wallet) external onlyOwner {
        require(status == 0 || (status == 1 && (startTime + T1 + T2 > now)), 'KiraAuction: not be able to config wallet after auction ended.');
        wallet = _wallet;
    }

    function setPrice(
        uint256 _p1,
        uint256 _p2,
        uint256 _p3,
        uint256 _t1,
        _uint256 _t2
    ) external onlyOwner {
        require(status == 0, 'KiraAuction: not be able to config the price because auction is already started.');
        require((_p1 > _p2) && (_p2 > _p3) && (_p3 >= 0), 'KiraAuction: price should go decreasing.');
        require(_t1 < _t2, 'KiraAuction: the first slope should have faster decreasing rate.');
        require((_t1 > 0) && (_t2 > 0), 'KiraAuction: the period of each slope should be greater than zero.');

        P1 = _p1;
        P2 = _p2;
        P3 = _p3;
        T1 = _t1;
        T2 = _t2;
        isPriceConfigured = true;
    }

    function whitelist(address addr) external onlyOwner {
        require(addr != address(0), 'KiraAuction: not be able to whitelist address(0).');
        whitelisted[addr] = true;

        emit AddedToWhitelist(addr);
    }

    receive() external payable {
        _processBuy(msg.sender, msg.value);
    }

    function _processBuy(address beneficiary, uint256 weiAmount) private {
        require(status != 0 && (startTime <= now), 'KiraAuction: auction is not started.');
        require(status != 2 && (now <= startTime + T1 + T2), 'KiraAuction: auction was ended.');

        if (status == 0) {
            // first time when a client sends ETH after start time
            // status should be updated as 'in-progress'
            status = 1;
        }

        require(beneficiary != address(0), 'KiraAuction: Not zero address');
        require(beneficiary != owner(), 'KiraAuction: Not owner');
        require(weiAmount >= MIN_WEI, 'KiraAuction: That isnt enought');
        require(whitelisted[beneficiary], "KiraAuction: You're not whitelisted, wait a moment");

        /*     ^
            P1 |        *
               |        '*
               |        ' *
               |        '  *
            P2 |        '   *
               |        '   '   *
               |        '   '       *
               |        '   '           *
            P3 |        '   '               *
               |        '   '               '
               |--------|---|---------------|------------------> Timeline
                          T1        T2
        Status  ----0---><--------1---------><--------2-------
        */

        uint256 ethPerToken;

        if (now < startTime + T1) {
            // Slope 1
            uint256 x = now - startTime;
            uint256 delta = x.mul(P1 - P2).div(T1);

            ethPerToken = P1.sub(delta);
        } else {
            uint256 x = now - startTime - T1;
            uint256 delta = x.mul(P2 - P3).div(T2);

            ethPerToken = P2.sub(delta);
        }

        if (claimed_wei[beneficiary] == 0) {
            contributors.push(beneficiary);
        }

        totalWeiAmount = totalWeiAmount.add(weiAmount);
        claimed_wei[beneficiary] = claimed_wei[beneficiary].add(weiAmount);

        uint256 numberOfTokens = kiraToken.balanceOf(address(this));
        uint256 cap = ethPerToken.mul(numberOfTokens);

        if (totalWeiAmount >= cap) {
            statis = 2;

            _distribute();
        }
    }

    function _distribute() internal {
        uint256 numberOfTokens = kiraToken.balanceOf(address(this));
        uint256 price = totalWeiAmount.div(numberOfTokens);

        uint256 numberOfContributors = contributors.length;
        for (uint256 i = 0; i < numberOfContributors; i++) {
            address addr = contributors[i];
            uint256 tokensToSend = claimed_wei[addr].div(price);

            uint256 currentBalance = kiraToken.balanceOf(address(this));

            if (currentBalance < tokensToSend) {
                tokensToSend = currentBalance;
            }

            kiraToken.transfer(addr, tokensToSend);
        }

        wallet.transfer(totalWeiAmount);
    }

    function withdrawFunds() external onlyOwner {
        address payable ownerWallet = msg.sender;
        ownerWallet.transfer(totalWeiAmount);
    }
}
