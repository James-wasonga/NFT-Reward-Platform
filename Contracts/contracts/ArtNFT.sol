

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CreatorToken.sol";

contract ArtNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    CreatorToken public creatorToken;
    uint256 public constant REWARD_AMOUNT = 10 * 10 ** 18;

    event NFTMinted(address indexed creator, uint256 indexed tokenId);

    constructor(address _creatorToken, address initialOwner)
        ERC721("ArtNFT", "ANFT")
        Ownable(initialOwner)
    {
        creatorToken = CreatorToken(_creatorToken);
    }

    function mint(string memory tokenURI) external {
        uint256 tokenId = nextTokenId;
        nextTokenId++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        creatorToken.mint(msg.sender, REWARD_AMOUNT);

        emit NFTMinted(msg.sender, tokenId);
    }
}

