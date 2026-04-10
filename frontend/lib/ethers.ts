import { ethers } from 'ethers';

// Minimal ABIs for frontend interaction
export const GAMECOIN_ABI = [
  'function purchase() external payable',
  'function redeem(uint256 amountCoins) external',
  'function balanceOf(address) view returns (uint256)',
  'function getBalance(address user) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
];

export const OFFGRID_CORE_ABI = [
  'function enterRace(bytes32 raceId) external',
  'function hasUserEntered(bytes32 raceId, address user) view returns (bool)',
  'function getRacePool(bytes32 raceId) view returns (uint256 totalPool, uint256 entryCount, bool isSettled)',
];

export const RANK_REGISTRY_ABI = [
  'function getCurrentRank(address user) view returns (uint256 rank, string rankName, uint256 totalPoints)',
  'function getRank(address user, uint256 season) view returns (uint256 rank, string rankName, uint256 totalPoints, uint256 updatedAt)',
];

const ADDRESSES = {
  gameCoin: process.env.NEXT_PUBLIC_GAMECOIN_ADDRESS!,
  offGridCore: process.env.NEXT_PUBLIC_OFFGRID_CORE_ADDRESS!,
  rankRegistry: process.env.NEXT_PUBLIC_RANK_REGISTRY_ADDRESS!,
};

export function getGameCoinContract(signerOrProvider: any) {
  return new ethers.Contract(ADDRESSES.gameCoin, GAMECOIN_ABI, signerOrProvider);
}

export function getOffGridCoreContract(signerOrProvider: any) {
  return new ethers.Contract(ADDRESSES.offGridCore, OFFGRID_CORE_ABI, signerOrProvider);
}

export function getRankRegistryContract(provider: any) {
  return new ethers.Contract(ADDRESSES.rankRegistry, RANK_REGISTRY_ABI, provider);
}

// Purchase GameCoins — user sends ETH
export async function purchaseGameCoins(signer: any, ethAmount: string) {
  const contract = getGameCoinContract(signer);
  const tx = await contract.purchase({ value: ethers.parseEther(ethAmount) });
  return tx.wait();
}

// Redeem GameCoins back to ETH
export async function redeemGameCoins(signer: any, coinAmount: number) {
  const contract = getGameCoinContract(signer);
  const tx = await contract.redeem(coinAmount);
  return tx.wait();
}

// Get on-chain GameCoin balance
export async function getOnChainBalance(address: string, provider: any): Promise<number> {
  const contract = getGameCoinContract(provider);
  const bal = await contract.getBalance(address);
  return Number(bal);
}

// Enter paid race (must approve first)
export async function enterPaidRace(signer: any, raceMongoId: string, entryFeeCoins: number) {
  const raceId = mongoIdToBytes32(raceMongoId);

  // Approve OffGridCore to spend GameCoins
  const gameCoin = getGameCoinContract(signer);
  const approveTx = await gameCoin.approve(
    ADDRESSES.offGridCore,
    ethers.parseUnits(entryFeeCoins.toString(), 18)
  );
  await approveTx.wait();

  // Enter race
  const core = getOffGridCoreContract(signer);
  const enterTx = await core.enterRace(raceId);
  return enterTx.wait();
}

// Get on-chain rank
export async function getOnChainRank(address: string, provider: any) {
  const contract = getRankRegistryContract(provider);
  const [rank, rankName, totalPoints] = await contract.getCurrentRank(address);
  return { rank: Number(rank), rankName, totalPoints: Number(totalPoints) };
}

// Convert MongoDB ObjectId (24-char hex string) to bytes32
export function mongoIdToBytes32(mongoId: string): string {
  return ethers.zeroPadValue('0x' + mongoId, 32);
}