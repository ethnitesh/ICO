// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./iCryptoDevs.sol";

contract CryptoDevTokens is ERC20, Ownable{

    iCryptoDevs CryptoDevsNFT;

    uint256 public constant tokenPrice = 0.001 ether;
    uint256 public constant tokensPerNFT = 10* 10**18;
    uint256 public constant maxTotalSupply = 10000 * 10**18;

    mapping (uint256 => bool) public tokenIdsClaimed;

    constructor(address _CryptoDevsContract ) ERC20 ("Crypto Dev Token","CD"){
        CryptoDevsNFT = iCryptoDevs(_CryptoDevsContract);
    }

    function mint(uint256 amount) public payable { 
         uint256 _requireAmount = tokenPrice*amount;
         require(msg.value >= _requireAmount, "ethers sent is incorrect");
         uint256 amountWithDecimals = amount * 10**18;
         require(totalSupply() + amountWithDecimals <= maxTotalSupply ,"Exceeds the max total supply available");
         _mint(msg.sender , amountWithDecimals);
    }

    function clam() public{
        address sender = msg.sender; 
        uint256 balance = CryptoDevsNFT.balanceOf(sender);
        require(balance > 0, "you dont own any Crypto Dev NFT's");
            uint256 amount = 0; 
        for (uint256 i=0; i<balance; i++){
            uint256 tokenId = CryptoDevsNFT.tokenOfOwnerByIndex(sender, i);
           if (!tokenIdsClaimed[tokenId]) {
            amount += 1;
            tokenIdsClaimed[tokenId] = true;

           }
        }  
        require(amount >0, "you have already claimed all yours tokens");
        _mint (msg.sender, amount * tokensPerNFT);
    } 
    receive() external payable {}
    fallback() external payable {}
}
