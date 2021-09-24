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


  /* function withdraw() public {
    require(isDeposited[msg.sender] == true, "Error, no previous deposit");
    
    uint userBalance = etherBalanceOf[msg.sender];
    uint depositTime = block.timestamp - depositStart[msg.sender];

    uint interestPerSecond = 31668017 * (userBalance / 1e16);
    uint interest = interestPerSecond * depositTime;

    msg.sender.transfer(userBalance);
    token.mint(msg.sender, interest);

    etherBalanceOf[msg.sender] = 0;
    depositStart[msg.sender] = 0;
    isDeposited[msg.sender] = false;

    emit Withdraw(msg.sender, userBalance, depositTime, interest);
  }

  function borrow() payable public {
    require(msg.value >= 1e16, "Error, deposit must be >= 0.1 ETH");
    require(isBorrowed[msg.sender] == false, "Error, user has an active loan!");

    etherCollateral[msg.sender] = etherCollateral[msg.sender] + msg.value;
    uint tokenAmountToMint = msg.value / 2;
    token.mint(msg.sender, tokenAmountToMint);

    isBorrowed[msg.sender] = true;

    emit Borrow(msg.sender, etherCollateral[msg.sender], tokenAmountToMint);
  }

  function payOff() public {
    require(isBorrowed[msg.sender] == true, "Error, user does not have an active loan!");
    require(token.transferFrom(msg.sender, address(this), etherCollateral[msg.sender] / 2), "Error, can't receive tokens.");

    uint fee = etherCollateral[msg.sender] / 10;
    msg.sender.transfer(etherCollateral[msg.sender] - fee);

    etherCollateral[msg.sender] = 0;
    isBorrowed[msg.sender] = false;

    emit PayOff(msg.sender, fee);
  } */
}