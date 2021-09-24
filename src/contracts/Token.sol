// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Token is ERC721 {
   using Counters for Counters.Counter;
   Counters.Counter private _tokenIds;
   mapping(uint256 => uint256) public NFTPrices;

  address public minter;
  event MinterChanged(address indexed from, address to);

   constructor() public ERC721("BarakaNFT", "BNFT") {
         minter = msg.sender;
   }

   function mintNFT(uint price,string memory tokenURI,  address creator) public returns (uint256) {
       require(msg.sender == minter, "Error, msg.sender does not have minter role");
       _tokenIds.increment();
       uint256 newItemId = _tokenIds.current();
       _mint(creator, newItemId);
       _setTokenURI(newItemId, tokenURI);
       NFTPrices[newItemId] = price;
       return newItemId;
   }

   function buyNFT(address from, address to, uint256 tokenId) public payable returns(bool) {
      transferFrom(from, to ,tokenId);
   }

   function burnNFT(uint256 tokenId) public {
     _burn(tokenId);
   }

  function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        _transfer(from, to, tokenId);
    }

     function passMinterRole(address NFTApp) public returns(bool) {
    require(msg.sender == minter, "Error, only owner can change pass minter role");
    minter = NFTApp;
    emit MinterChanged(msg.sender, NFTApp);
    return true;
  }

}