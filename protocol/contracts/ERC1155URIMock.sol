// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "./ERC1155Mock.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

contract ERC1155URIStorageMock is ERC1155Mock, ERC1155URIStorage {
    constructor(string memory _uri) ERC1155Mock(_uri) {}

    function uri(uint256 tokenId)
        public
        view
        virtual
        override(ERC1155, ERC1155URIStorage)
        returns (string memory)
    {
        return ERC1155URIStorage.uri(tokenId);
    }

    function setURI(uint256 tokenId, string memory _tokenURI) public {
        _setURI(tokenId, _tokenURI);
    }

    function setBaseURI(string memory baseURI) public {
        _setBaseURI(baseURI);
    }

    // function safeTransferFrom(
    //     address from,
    //     address to,
    //     uint256 id,
    //     uint256 amount
    // ) public {
    //     require(
    //         from == _msgSender() || isApprovedForAll(from, _msgSender()),
    //         "ERC1155: caller is not owner nor approved"
    //     );
    //     _safeTransferFrom(from, to, id, amount, bytes("0x0"));
    // }
}
