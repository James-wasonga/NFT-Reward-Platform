// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CreatorToken is ERC20, Ownable {
    constructor() ERC20("CreatorToken", "CTK") {}

    function rewardCreator(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

contract ArtNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    CreatorToken public rewardToken;
    mapping(uint256 => address) public creators;

    event NFTMinted(uint256 tokenId, address creator, string tokenURI);

    constructor(address tokenAddress) ERC721("ArtNFT", "ANFT") {
        rewardToken = CreatorToken(tokenAddress);
    }

    function mintNFT(string memory tokenURI) public {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        creators[newItemId] = msg.sender;

        rewardToken.rewardCreator(msg.sender, 10 * 10**18);
        emit NFTMinted(newItemId, msg.sender, tokenURI);
    }
}
