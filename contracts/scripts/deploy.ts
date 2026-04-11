import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with:', deployer.address);
  console.log('Balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'MATIC');

  // 1. Deploy GameCoin
  // ratePerEth: 60,000,000 GameCoins per 1 ETH/MATIC
  const GameCoin = await ethers.getContractFactory('GameCoin');
  const gameCoin = await GameCoin.deploy(12000);
  await gameCoin.waitForDeployment();
  console.log('GameCoin deployed:', await gameCoin.getAddress());

  // 2. Deploy LapLogicCore
  // entryFeeCoins: 3000 GameCoins (~₹50 at assumed rate)
  // platformFeePercent: 10%
  const LapLogicCore = await ethers.getContractFactory('LapLogicCore');
  const lapLogicCore = await LapLogicCore.deploy(
    await gameCoin.getAddress(),
    3000,
    10
  );
  await lapLogicCore.waitForDeployment();
  console.log('LapLogicCore deployed:', await lapLogicCore.getAddress());

  // 3. Deploy RankRegistry
  const RankRegistry = await ethers.getContractFactory('RankRegistry');
  const rankRegistry = await RankRegistry.deploy();
  await rankRegistry.waitForDeployment();
  console.log('RankRegistry deployed:', await rankRegistry.getAddress());

  // 4. Link contracts
  // Tell GameCoin about LapLogicCore
  const tx1 = await gameCoin.setLapLogicCore(await lapLogicCore.getAddress());
  await tx1.wait();
  console.log('GameCoin linked to LapLogicCore');

  // Set backend writer on RankRegistry (use your backend server's wallet address)
  // Replace with actual backend wallet address
  const BACKEND_WALLET = process.env.BACKEND_WALLET_ADDRESS || deployer.address;
  const tx2 = await rankRegistry.setBackendWriter(BACKEND_WALLET);
  await tx2.wait();
  console.log('RankRegistry backend writer set');

  // 5. Fund LapLogicCore with initial GameCoins for reward distribution
  // Mint 10M GameCoins to LapLogicCore for initial pool
  const tx3 = await gameCoin.mint(await lapLogicCore.getAddress(), ethers.parseUnits('10000000', 18));
  await tx3.wait();
  console.log('LapLogicCore funded with 10M GameCoins');

  console.log('\n=== DEPLOYMENT COMPLETE ===');
  console.log('GAMECOIN_ADDRESS=', await gameCoin.getAddress());
  console.log('LAPLOGIC_CORE_ADDRESS=', await lapLogicCore.getAddress());
  console.log('RANK_REGISTRY_ADDRESS=', await rankRegistry.getAddress());
  console.log('\nCopy these to your backend .env file');
}

main().catch(console.error);
