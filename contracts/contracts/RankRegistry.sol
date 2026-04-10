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
