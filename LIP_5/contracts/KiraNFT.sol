//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IKexFarm {
    function rewardedStones(address staker) external view returns (uint256);

    function payment(address staker, uint256 amount) external returns (bool);
}

struct Card {
    uint24 quantity;
    uint256 sold;
    uint256 value;
}

contract KiraNFT is ERC1155, Ownable {
    using SafeMath for uint256;
    IKexFarm _farmer;

    mapping(uint256 => Card) public cards;

    constructor() ERC1155("http://api.ethernity.io/cards/stones/{id}") {}

    function addCard(
        uint256 id,
        uint24 quantity,
        uint256 amount
    ) public onlyOwner {
        require(cards[id].value == 0, "The card is already exists!");
        cards[id] = Card(quantity, 0, amount);
    }

    function addCardBatch(
        uint256[] memory ids,
        uint24[] memory quantities,
        uint256[] memory amounts
    ) public onlyOwner {
        require(
            ids.length == quantities.length && ids.length == amounts.length,
            "Cards aren't consistent!"
        );

        for (uint24 i = 0; i < ids.length; i++) {
            addCard(ids[i], quantities[i], amounts[i]);
        }
    }

    function setFarmerAddress(IKexFarm farmer) external returns (bool) {
        _farmer = farmer;
        return true;
    }

    function isCardPayable(uint256 id) public view returns (bool) {
        if (cards[id].quantity == cards[id].sold) {
            return false;
        }

        return true;
    }

    function buy(uint256 id) public {
        address sender = msg.sender;
        require(isCardPayable(id), "Card is not payable!");
        uint256 amount = cards[id].value;
        require(_farmer.payment(sender, amount), "Payment problem!");
        _mint(sender, id, 1, "");
        cards[id].sold = cards[id].sold.add(1);
    }
}
