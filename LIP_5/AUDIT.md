

# Review Notes 1

## KFL-01
* Removed `giveAway` from KexFarm, there is no need to give-away any stones
* Kept `setTokenAddress`, the KEX Address might need to be updated after deployment, the ownership will be rejected afterwards

## KFL-02
* Added require cecheck to ensure that only specific aller can interact with payment() function
* Added `setMinterAddress` so that it is possible to define KiraNFT contract address after deployed.
* The `setMinterAddress` can only be called by the owner and it is NOTED that the ownership will be rejected after initial setup, similar to KFL-01 suggestions

### KNF-01
* Ownership is inteded to be rejected once no more changes are necessary after deployment

### KFL-02
```
We are using IPFS mutable file system, the CID once suffixed with the path corresponding to the NFT token ID gives you correct metadata and there are no different CID hashes.

For example, the base URL is: https://ipfs.kira.network/ipfs/QmRT4JjEUrRqQwC16AP7UVDqe1NpH2FCNEk5X2AezzHj5M

Metadata for the NFT 1 would be: https://ipfs.kira.network/ipfs/QmRT4JjEUrRqQwC16AP7UVDqe1NpH2FCNEk5X2AezzHj5M/1

Metadata for NFT2 is: https://ipfs.kira.network/ipfs/QmRT4JjEUrRqQwC16AP7UVDqe1NpH2FCNEk5X2AezzHj5M/2
And so on...

As it is evident you can see the root CID does not change at all, but the metadata changes.
Further elaboration on any logical issues shoudl be provided
```

# KNF-03
* Added `import '@openzeppelin/contracts/security/ReentrancyGuard.sol';`
* Added `nonReentrant` tag to buy function

# LIK-01
* Removed all `imports "@openzeppelin/contracts/utils/math/SafeMath.sol";`
* Removed all instances of `using SafeMath for uint256;`

# LIK-02
* Added `import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';`
* Added `using SafeERC20 for IERC20;`

# NFT-01
* Ownership is inteded to be rejected once no more changes are necessary after deployment

# NFT-02
* Removed nonReentrant from all onwerOnly (already nonReentrant) funcitons

# NFT-03
* Added `require((_poolId >= 0 && _poolId < stakingPoolsCount), "Invalid poolId range")`

## NFT-04
* Eplaced `rewardOf(_poolId, _msgSender()).div(balance.amount).mul(_count);` with `rewardOf(_poolId, _msgSender()).mul(_count).div(balance.amount);`