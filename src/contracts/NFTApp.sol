// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./Token.sol";

contract NFTApp {

  Token private token;

  event TokenMinted(address indexed user, uint256 tokenId, uint price);

  constructor(Token _token) public {
    token = _token;
  }


  function mint(uint price, string memory tokenURI) public{
    uint256 tokenId = token.mintNFT(price, tokenURI,  msg.sender);
    emit TokenMinted(msg.sender, tokenId, price);
  }

  function buy(address payable from, address to, uint256 tokenId) public payable {
    uint256 NFTPrice = token.NFTPrices(tokenId);
    require(NFTPrice == msg.value, "Please send correct price.");
      from.transfer(msg.value);
      token.buyNFT(from, to, tokenId);
  }

  function burnNFT(uint256 tokenId) public {
    require(msg.sender == token.ownerOf(tokenId), "Only owner of the token can burn the token.");
    token.burnNFT(tokenId);
  }

  function editNFTPrice(uint256 price, uint256 tokenId) public {
    require(msg.sender == token.ownerOf(tokenId), "Only owner of the token can edit the price.");
    token.editNFTPrice(price, tokenId);
  }

  function getNFTInfo(uint256 tokenId) public view returns(address, uint256, string memory, uint256) {
    return (token.ownerOf(tokenId), token.NFTPrices(tokenId), token.tokenURI(tokenId), tokenId);
  }

  function getBalance() public view returns(uint256) {
    return token.balanceOf(msg.sender);
  }

  function getTokenIds() public view returns(uint256[] memory) {
    uint256 balance = token.balanceOf(msg.sender);
    uint256[] memory tokenIds = new uint256[](balance);
    for(uint256 i=0; i<balance; i++) {
      uint256 tokenId = token.tokenOfOwnerByIndex(msg.sender, i);
      tokenIds[i] = tokenId;
    }

    return tokenIds;

  }

}