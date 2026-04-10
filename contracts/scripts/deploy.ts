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
  const BACKEND_WALLET = process.env.BACKEND_WALLET_ADDRESS || deployer.address;
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
