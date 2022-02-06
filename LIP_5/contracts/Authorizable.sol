// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Authorizable is Ownable {
    address[] private _authorizedAddresses;

    function addAuthorizedAddress(address address_)
        external
        onlyOwner
        returns (bool)
    {
        _authorizedAddresses.push(address_);
        return true;
    }

    function removeAuthorizedAddress(address address_)
        external
        onlyOwner
        returns (bool)
    {
        address[] memory authorizedAddresses_;

        for (uint256 i = 0; i < _authorizedAddresses.length - 1; i++) {
            if (_authorizedAddresses[i] != address_) {
                authorizedAddresses_[
                    authorizedAddresses_.length
                ] = _authorizedAddresses[i];
            }
        }

        _authorizedAddresses = authorizedAddresses_;

        return true;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function authorizedAddresses()
        public
        view
        onlyOwner
        returns (address[] memory)
    {
        return _authorizedAddresses;
    }

    modifier onlyAuthorized() {
        address msgSender = _msgSender();
        bool isAuthorized = false;

        for (uint256 i = 0; i < _authorizedAddresses.length; i++) {
            if (_authorizedAddresses[i] == msgSender) {
                isAuthorized = true;
            }
        }

        require(isAuthorized, "Sender not authorized.");

        _;
    }
}
