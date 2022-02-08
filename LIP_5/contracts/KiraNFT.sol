//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

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

    string tokenUri = 'ipfs://QmRT4JjEUrRqQwC16AP7UVDqe1NpH2FCNEk5X2AezzHj5M/';

    constructor() ERC1155('ipfs://QmRT4JjEUrRqQwC16AP7UVDqe1NpH2FCNEk5X2AezzHj5M/') {}

    function setTokenURI(string calldata _uri) public onlyOwner {
        tokenUri = _uri;
    }

    /**
     * @notice Convert uint256 to string
     * @param _i Unsigned integer to convert to string
     */
    function _uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return '0';
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * @dev See {IERC1155MetadataURI-uri}.
     *
     * This implementation returns the same URI for all token types. It relies
     * on the token type ID substituion mechanism
     * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP].
     *
     * Clients calling this function must replace the \{id\} substring with the
     * actual token type ID.
     */
    function uri(uint256 _id) public view override returns (string memory) {
        return string(abi.encodePacked(tokenUri, _uint2str(_id)));
    }

    function addCard(
        uint256 id,
        uint24 quantity,
        uint256 amount
    ) public onlyOwner {
        require(cards[id].value == 0, 'The card is already exists!');
        cards[id] = Card(quantity, 0, amount);
    }

    function addCardBatch(
        uint256[] memory ids,
        uint24[] memory quantities,
        uint256[] memory amounts
    ) public onlyOwner {
        require(ids.length == quantities.length && ids.length == amounts.length, "Cards aren't consistent!");

        for (uint24 i = 0; i < ids.length; i++) {
            addCard(ids[i], quantities[i], amounts[i]);
        }
    }

    function setFarmerAddress(IKexFarm farmer) public onlyOwner returns (bool) {
        _farmer = farmer;
        return true;
    }

    function isCardPayable(uint256 id, uint256 count) public view returns (bool) {
        if (cards[id].quantity < cards[id].sold + count) {
            return false;
        }

        return true;
    }

    function buy(uint256 id, uint256 count) external {
        address sender = msg.sender;
        require(isCardPayable(id, count), 'Card is not payable!');
        uint256 amount = cards[id].value.mul(count);
        require(_farmer.payment(sender, amount), 'Payment problem!');
        _mint(sender, id, count, '');
        cards[id].sold = cards[id].sold.add(count);
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        _mint(account, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }
}
