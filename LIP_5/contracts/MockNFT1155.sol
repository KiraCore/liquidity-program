//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MockNFT1155 is ERC1155 {
    uint256 public constant GOLD = 0;

    constructor() ERC1155("https://mock.example/api/item/{id}.json") {
        _mint(msg.sender, GOLD, 10000, "");
    }
}
