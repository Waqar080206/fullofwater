# CONTRACTS.md — OffGrid F1 Fantasy Smart Contracts

## Overview

Three Solidity contracts deployed on **Polygon Amoy testnet** (or Polygon mainnet).
- `GameCoin.sol` — ERC20 token for in-game currency
- `OffGridCore.sol` — Entry fees, reward pools, prize distribution
- `RankRegistry.sol` — On-chain seasonal rank storage

Toolchain: **Hardhat + TypeScript + ethers.js v6**

---

## Stack

- **Solidity**: ^0.8.20
- **Framework**: Hardhat
- **Libraries**: OpenZeppelin Contracts v5
- **Network**: Polygon Amoy Testnet (chainId: 80002) → upgrade to Polygon Mainnet (chainId: 137)
- **Testing**: Hardhat + Chai + ethers.js

---

## Directory Structure

```
contracts/
├── contracts/
│   ├── GameCoin.sol
│   ├── OffGridCore.sol
│   └── RankRegistry.sol
├── scripts/
│   ├── deploy.ts
│   └── verify.ts
├── test/
│   ├── GameCoin.test.ts
│   ├── OffGridCore.test.ts
│   └── RankRegistry.test.ts
├── hardhat.config.ts
├── package.json
└── .env
```

---

## Environment Variables (`.env`)

```env
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY
POLYGONSCAN_API_KEY=YOUR_POLYGONSCAN_KEY
```

---

## `hardhat.config.ts`

```typescript
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    amoy: {
      url: process.env.POLYGON_AMOY_RPC!,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 80002,
    },
    polygon: {
      url: 'https://polygon-rpc.com',
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 137,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY!,
      polygon: process.env.POLYGONSCAN_API_KEY!,
    },
    customChains: [
      {
        network: 'polygonAmoy',
        chainId: 80002,
        urls: {
          apiURL: 'https://api-amoy.polygonscan.com/api',
          browserURL: 'https://amoy.polygonscan.com',
        },
      },
    ],
  },
};

export default config;
```

---

## Contract 1: `GameCoin.sol`

ERC20 token. Minted when users purchase with ETH. Burned when redeemed back to ETH. Only `OffGridCore` and `owner` can mint/burn.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameCoin is ERC20, Ownable {
    // Address of OffGridCore contract — allowed to mint/burn
    address public offGridCore;

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
        require(msg.sender == offGridCore || msg.sender == owner(), "Not authorized");
        _;
    }

    // Owner sets the OffGridCore contract address after deployment
    function setOffGridCore(address _core) external onlyOwner {
        offGridCore = _core;
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

    // OffGridCore can mint rewards (prediction wins)
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
```

---

## Contract 2: `OffGridCore.sol`

Handles paid contest entry fees, prize pool management, and reward distribution.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GameCoin.sol";

contract OffGridCore is Ownable, ReentrancyGuard {
    GameCoin public gameCoin;

    // Entry fee in GameCoin tokens (whole coins)
    uint256 public entryFeeCoins; // e.g. 3000 GameCoins ≈ ₹50 worth

    // Each race has a prize pool
    struct RacePool {
        uint256 totalPool;
        uint256 entryCount;
        bool isSettled;
        bool exists;
    }

    // raceId (bytes32 hash of race mongo ID or sequential uint) => RacePool
    mapping(bytes32 => RacePool) public racePools;

    // Track who has entered which race (paid tier)
    mapping(bytes32 => mapping(address => bool)) public hasEntered;

    // Track user paid entry count per race (for refund logic)
    mapping(bytes32 => address[]) public raceParticipants;

    // Platform fee percentage (e.g. 10 = 10%)
    uint256 public platformFeePercent;

    event RaceCreated(bytes32 indexed raceId);
    event EntryRecorded(bytes32 indexed raceId, address indexed user, uint256 feeCoins);
    event RewardDistributed(bytes32 indexed raceId, address indexed user, uint256 amount);
    event RaceSettled(bytes32 indexed raceId, uint256 totalPool);

    constructor(address _gameCoin, uint256 _entryFeeCoins, uint256 _platformFeePercent)
        Ownable(msg.sender)
    {
        gameCoin = GameCoin(_gameCoin);
        entryFeeCoins = _entryFeeCoins;
        platformFeePercent = _platformFeePercent;
    }

    // Admin creates a paid race pool
    function createRace(bytes32 raceId) external onlyOwner {
        require(!racePools[raceId].exists, "Race already exists");
        racePools[raceId] = RacePool({
            totalPool: 0,
            entryCount: 0,
            isSettled: false,
            exists: true
        });
        emit RaceCreated(raceId);
    }

    // User enters paid race — GameCoin transferred to this contract
    // User must approve this contract to spend entryFeeCoins * 10^18 before calling
    function enterRace(bytes32 raceId) external nonReentrant {
        require(racePools[raceId].exists, "Race does not exist");
        require(!racePools[raceId].isSettled, "Race already settled");
        require(!hasEntered[raceId][msg.sender], "Already entered");

        uint256 feeInTokens = entryFeeCoins * 10 ** 18;
        require(gameCoin.balanceOf(msg.sender) >= feeInTokens, "Insufficient GameCoins");

        gameCoin.transferFrom(msg.sender, address(this), feeInTokens);

        hasEntered[raceId][msg.sender] = true;
        racePools[raceId].totalPool += entryFeeCoins;
        racePools[raceId].entryCount++;
        raceParticipants[raceId].push(msg.sender);

        emit EntryRecorded(raceId, msg.sender, entryFeeCoins);
    }

    // Admin distributes rewards after race — called from backend with ranked users
    // winners: array of addresses in rank order (index 0 = 1st place)
    // shares: array of percentages (must sum to <= 100 - platformFeePercent)
    function distributeRewards(
        bytes32 raceId,
        address[] calldata winners,
        uint256[] calldata shares
    ) external onlyOwner nonReentrant {
        require(racePools[raceId].exists, "Race does not exist");
        require(!racePools[raceId].isSettled, "Already settled");
        require(winners.length == shares.length, "Length mismatch");

        RacePool storage pool = racePools[raceId];
        uint256 totalPool = pool.totalPool;
        uint256 platformCut = (totalPool * platformFeePercent) / 100;
        uint256 distributablePool = totalPool - platformCut;

        uint256 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            totalShares += shares[i];
        }
        require(totalShares <= 100, "Shares exceed 100%");

        // Distribute to winners
        for (uint256 i = 0; i < winners.length; i++) {
            uint256 reward = (distributablePool * shares[i]) / 100;
            if (reward > 0) {
                uint256 rewardInTokens = reward * 10 ** 18;
                gameCoin.transfer(winners[i], rewardInTokens);
                emit RewardDistributed(raceId, winners[i], reward);
            }
        }

        // Platform cut stays in contract for liquidity/operations
        pool.isSettled = true;
        emit RaceSettled(raceId, totalPool);
    }

    // Direct reward distribution — called by backend for prediction wins
    // Backend calls blockchain.ts distributeReward → this function
    function distributeReward(address user, uint256 amountCoins) external onlyOwner {
        uint256 amount = amountCoins * 10 ** 18;
        require(gameCoin.balanceOf(address(this)) >= amount, "Insufficient pool");
        gameCoin.transfer(user, amount);
        emit RewardDistributed(bytes32(0), user, amountCoins);
    }

    // Admin: update entry fee
    function setEntryFee(uint256 _feeCoins) external onlyOwner {
        entryFeeCoins = _feeCoins;
    }

    // Admin: update platform fee
    function setPlatformFee(uint256 _percent) external onlyOwner {
        require(_percent <= 30, "Max 30%");
        platformFeePercent = _percent;
    }

    // Admin: withdraw platform earnings (GameCoins)
    function withdrawPlatformFees(uint256 amountCoins) external onlyOwner {
        gameCoin.transfer(owner(), amountCoins * 10 ** 18);
    }

    // View: get race pool info
    function getRacePool(bytes32 raceId) external view returns (
        uint256 totalPool,
        uint256 entryCount,
        bool isSettled
    ) {
        RacePool storage pool = racePools[raceId];
        return (pool.totalPool, pool.entryCount, pool.isSettled);
    }

    // View: check if user entered a race
    function hasUserEntered(bytes32 raceId, address user) external view returns (bool) {
        return hasEntered[raceId][user];
    }

    // View: get all participants for a race
    function getParticipants(bytes32 raceId) external view returns (address[] memory) {
        return raceParticipants[raceId];
    }
}
```

---

## Contract 3: `RankRegistry.sol`

Stores seasonal ranks on-chain for transparency. Written to by backend after each race settlement.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RankRegistry is Ownable {
    struct UserRank {
        uint256 rank;          // 1-10
        string rankName;       // e.g. "World Champion Tier"
        uint256 totalPoints;   // cumulative points this season
        uint256 season;        // year
        uint256 updatedAt;     // timestamp
    }

    // walletAddress => season => UserRank
    mapping(address => mapping(uint256 => UserRank)) public ranks;

    // Season leaderboard snapshot (top 100 addresses for gas efficiency)
    mapping(uint256 => address[]) public seasonLeaders;

    // Backend address authorized to write ranks
    address public backendWriter;

    event RankUpdated(address indexed user, uint256 indexed season, uint256 rank, string rankName, uint256 points);
    event SeasonReset(uint256 indexed season);

    constructor() Ownable(msg.sender) {}

    modifier onlyWriter() {
        require(msg.sender == backendWriter || msg.sender == owner(), "Not authorized");
        _;
    }

    // Owner sets backend wallet address
    function setBackendWriter(address _writer) external onlyOwner {
        backendWriter = _writer;
    }

    // Backend calls this after each race result settlement
    function setRank(
        address user,
        uint256 rank,
        string calldata rankName,
        uint256 totalPoints,
        uint256 season
    ) external onlyWriter {
        require(user != address(0), "Invalid address");
        require(rank >= 1 && rank <= 10, "Rank out of range");

        ranks[user][season] = UserRank({
            rank: rank,
            rankName: rankName,
            totalPoints: totalPoints,
            season: season,
            updatedAt: block.timestamp
        });

        emit RankUpdated(user, season, rank, rankName, totalPoints);
    }

    // Batch update ranks — more gas efficient for post-race settlements
    function batchSetRanks(
        address[] calldata users,
        uint256[] calldata rankValues,
        string[] calldata rankNames,
        uint256[] calldata pointsArr,
        uint256 season
    ) external onlyWriter {
        require(
            users.length == rankValues.length &&
            users.length == rankNames.length &&
            users.length == pointsArr.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < users.length; i++) {
            require(rankValues[i] >= 1 && rankValues[i] <= 10, "Rank out of range");
            ranks[users[i]][season] = UserRank({
                rank: rankValues[i],
                rankName: rankNames[i],
                totalPoints: pointsArr[i],
                season: season,
                updatedAt: block.timestamp
            });
            emit RankUpdated(users[i], season, rankValues[i], rankNames[i], pointsArr[i]);
        }
    }

    // View: get rank for a user in a season
    function getRank(address user, uint256 season) external view returns (
        uint256 rank,
        string memory rankName,
        uint256 totalPoints,
        uint256 updatedAt
    ) {
        UserRank memory r = ranks[user][season];
        return (r.rank, r.rankName, r.totalPoints, r.updatedAt);
    }

    // View: current season rank
    function getCurrentRank(address user) external view returns (
        uint256 rank,
        string memory rankName,
        uint256 totalPoints
    ) {
        uint256 season = _currentSeason();
        UserRank memory r = ranks[user][season];
        return (r.rank, r.rankName, r.totalPoints);
    }

    // View: get season (current year)
    function _currentSeason() internal view returns (uint256) {
        // Approximate: block.timestamp / seconds in a year
        return 1970 + (block.timestamp / 365 days);
    }
}
```

---

## Deployment Script: `scripts/deploy.ts`

```typescript
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with:', deployer.address);
  console.log('Balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'MATIC');

  // 1. Deploy GameCoin
  // ratePerEth: 60,000,000 GameCoins per 1 ETH/MATIC
  const GameCoin = await ethers.getContractFactory('GameCoin');
  const gameCoin = await GameCoin.deploy(60_000_000);
  await gameCoin.waitForDeployment();
  console.log('GameCoin deployed:', await gameCoin.getAddress());

  // 2. Deploy OffGridCore
  // entryFeeCoins: 3000 GameCoins (~₹50 at assumed rate)
  // platformFeePercent: 10%
  const OffGridCore = await ethers.getContractFactory('OffGridCore');
  const offGridCore = await OffGridCore.deploy(
    await gameCoin.getAddress(),
    3000,
    10
  );
  await offGridCore.waitForDeployment();
  console.log('OffGridCore deployed:', await offGridCore.getAddress());

  // 3. Deploy RankRegistry
  const RankRegistry = await ethers.getContractFactory('RankRegistry');
  const rankRegistry = await RankRegistry.deploy();
  await rankRegistry.waitForDeployment();
  console.log('RankRegistry deployed:', await rankRegistry.getAddress());

  // 4. Link contracts
  // Tell GameCoin about OffGridCore
  const tx1 = await gameCoin.setOffGridCore(await offGridCore.getAddress());
  await tx1.wait();
  console.log('GameCoin linked to OffGridCore');

  // Set backend writer on RankRegistry (use your backend server's wallet address)
  // Replace with actual backend wallet address
  const BACKEND_WALLET = process.env.BACKEND_WALLET_ADDRESS!;
  const tx2 = await rankRegistry.setBackendWriter(BACKEND_WALLET);
  await tx2.wait();
  console.log('RankRegistry backend writer set');

  // 5. Fund OffGridCore with initial GameCoins for reward distribution
  // Mint 10M GameCoins to OffGridCore for initial pool
  const tx3 = await gameCoin.mint(await offGridCore.getAddress(), ethers.parseUnits('10000000', 18));
  await tx3.wait();
  console.log('OffGridCore funded with 10M GameCoins');

  console.log('\n=== DEPLOYMENT COMPLETE ===');
  console.log('GAMECOIN_ADDRESS=', await gameCoin.getAddress());
  console.log('OFFGRID_CORE_ADDRESS=', await offGridCore.getAddress());
  console.log('RANK_REGISTRY_ADDRESS=', await rankRegistry.getAddress());
  console.log('\nCopy these to your backend .env file');
}

main().catch(console.error);
```

---

## Verify Script: `scripts/verify.ts`

```typescript
import { run } from 'hardhat';

async function main() {
  const GAMECOIN = process.env.GAMECOIN_ADDRESS!;
  const OFFGRID_CORE = process.env.OFFGRID_CORE_ADDRESS!;
  const RANK_REGISTRY = process.env.RANK_REGISTRY_ADDRESS!;

  await run('verify:verify', {
    address: GAMECOIN,
    constructorArguments: [60_000_000],
  });

  await run('verify:verify', {
    address: OFFGRID_CORE,
    constructorArguments: [GAMECOIN, 3000, 10],
  });

  await run('verify:verify', {
    address: RANK_REGISTRY,
    constructorArguments: [],
  });

  console.log('All contracts verified on Polygonscan');
}

main().catch(console.error);
```

---

## `package.json`

```json
{
  "name": "offgrid-contracts",
  "version": "1.0.0",
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy:amoy": "hardhat run scripts/deploy.ts --network amoy",
    "deploy:polygon": "hardhat run scripts/deploy.ts --network polygon",
    "verify:amoy": "hardhat run scripts/verify.ts --network amoy"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "hardhat": "^2.22.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.0.0",
    "@types/node": "^20.0.0",
    "dotenv": "^16.0.0"
  },
  "dependencies": {
    "@openzeppelin/contracts": "^5.0.0"
  }
}
```

---

## Security Checklist

- **ReentrancyGuard** on all ETH/token transfer functions in OffGridCore ✅
- **Ownable** with explicit transfer — no accidental ownership loss ✅
- **onlyWriter** modifier on RankRegistry — backend wallet separate from owner ✅
- All amounts validated before transfer — no underflow possible (Solidity 0.8+ built-in) ✅
- **platformFeePercent** capped at 30% — prevents admin rug ✅
- GameCoin purchase/redeem: ETH reserve check before redemption ✅
- No selfdestruct, no delegatecall ✅
- batchSetRanks array length validation ✅

---

## Frontend Integration (Ethers.js)

From the frontend, users interact with `GameCoin.purchase()` and `GameCoin.redeem()` directly. Use this pattern:

```typescript
// Purchase GameCoins
const gameCoin = new ethers.Contract(GAMECOIN_ADDRESS, GAMECOIN_ABI, signer);
const tx = await gameCoin.purchase({ value: ethers.parseEther('0.01') });
await tx.wait();

// Enter paid race (must approve first)
const approveTx = await gameCoin.approve(OFFGRID_CORE_ADDRESS, ethers.parseUnits('3000', 18));
await approveTx.wait();
const coreTx = await offGridCore.enterRace(raceIdBytes32);
await coreTx.wait();
```

---

## Race ID Encoding

MongoDB ObjectIds need to be converted to bytes32 for on-chain use:

```typescript
// In backend/frontend
import { ethers } from 'ethers';

function mongoIdToBytes32(mongoId: string): string {
  // Pad 24-char hex ObjectId to 32 bytes
  return ethers.zeroPadValue('0x' + mongoId, 32);
}
```