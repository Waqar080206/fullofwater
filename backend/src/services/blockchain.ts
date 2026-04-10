import { ethers } from 'ethers';

// Minimal ABIs — only what we call from backend
const RANK_REGISTRY_ABI = [
  'function setRank(address user, uint256 rank, string calldata rankName) external',
];

const OFFGRID_CORE_ABI = [
  'function distributeReward(address user, uint256 amount) external',
];

function getProvider() {
  return new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL!);
}

function getAdminWallet() {
  return new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, getProvider());
}

export async function updateRankOnChain(
  walletAddress: string,
  rank: number,
  rankName: string
): Promise<string> {
  const wallet = getAdminWallet();
  const contract = new ethers.Contract(
    process.env.RANK_REGISTRY_ADDRESS!,
    RANK_REGISTRY_ABI,
    wallet
  );
  const tx = await contract.setRank(walletAddress, rank, rankName);
  await tx.wait();
  return tx.hash;
}

export async function distributeRewardOnChain(
  walletAddress: string,
  amountInGameCoins: number
): Promise<string> {
  // Convert GameCoins to token units (18 decimals)
  const wallet = getAdminWallet();
  const contract = new ethers.Contract(
    process.env.OFFGRID_CORE_ADDRESS!,
    OFFGRID_CORE_ABI,
    wallet
  );
  const amount = ethers.parseUnits(amountInGameCoins.toString(), 18);
  const tx = await contract.distributeReward(walletAddress, amount);
  await tx.wait();
  return tx.hash;
}