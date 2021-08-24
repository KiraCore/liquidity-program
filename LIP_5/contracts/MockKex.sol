//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract MockKex is ERC20Burnable {
    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 initialSupply
    ) ERC20(_tokenName, _tokenSymbol) {
        _mint(_msgSender(), initialSupply);
    }
}
