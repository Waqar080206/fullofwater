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
