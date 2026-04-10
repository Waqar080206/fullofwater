// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameCoin is ERC20, Ownable {
    // Address of LapLogicCore contract — allowed to mint/burn
    address public lapLogicCore;

    // ETH to GameCoin exchange rate: 1 ETH = X GameCoins
    // Set by owner (admin), updated manually
    uint256 public ratePerEth; // e.g. 60_000_000 means 1 ETH = 60M GameCoins

    event RateUpdated(uint256 newRate);
    event CoreUpdated(address newCore);
    event Purchased(address indexed user, uint256 ethPaid, uint256 coinsMinted);
    event Redeemed(address indexed user, uint256 coinsBurned, uint256 ethReturned);

    constructor(uint256 _ratePerEth) ERC20("GameCoin", "GC") Ownable(msg.sender) {
        ratePerEth = _ratePerEth;
    }

    modifier onlyCoreOrOwner() {
        require(msg.sender == lapLogicCore || msg.sender == owner(), "Not authorized");
        _;
    }

    // Owner sets the LapLogicCore contract address after deployment
    function setLapLogicCore(address _core) external onlyOwner {
        lapLogicCore = _core;
        emit CoreUpdated(_core);
    }

    // Update exchange rate
    function setRate(uint256 _rate) external onlyOwner {
        require(_rate > 0, "Rate must be positive");
        ratePerEth = _rate;
        emit RateUpdated(_rate);
    }

    // Users call this to buy GameCoins with ETH
    function purchase() external payable {
        require(msg.value > 0, "Send ETH to purchase");
        // Calculate coins: (ethSent * ratePerEth) / 1 ether
        uint256 coins = (msg.value * ratePerEth) / 1 ether;
        require(coins > 0, "Coins too small");
        _mint(msg.sender, coins * 10 ** decimals());
        emit Purchased(msg.sender, msg.value, coins);
    }

    // Users redeem GameCoins back to ETH
    // amountCoins: in whole coins (not wei), backend mirrors this
    function redeem(uint256 amountCoins) external {
        require(amountCoins > 0, "Amount must be positive");
        uint256 tokenAmount = amountCoins * 10 ** decimals();
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient GameCoins");

        uint256 ethToReturn = (amountCoins * 1 ether) / ratePerEth;
        require(address(this).balance >= ethToReturn, "Contract: insufficient ETH reserves");

        _burn(msg.sender, tokenAmount);
        payable(msg.sender).transfer(ethToReturn);
        emit Redeemed(msg.sender, amountCoins, ethToReturn);
    }

    // LapLogicCore can mint rewards (prediction wins)
    function mintReward(address to, uint256 amountCoins) external onlyCoreOrOwner {
        _mint(to, amountCoins * 10 ** decimals());
    }

    // Owner can mint (for seeding/testing)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Fund contract with ETH for redemptions
    receive() external payable {}

    // Emergency withdraw ETH — owner only
    function withdrawETH(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }

    function getBalance(address user) external view returns (uint256) {
        return balanceOf(user) / 10 ** decimals();
    }
}
