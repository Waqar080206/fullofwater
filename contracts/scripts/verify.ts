import { run } from 'hardhat';

async function main() {
  const GAMECOIN = process.env.GAMECOIN_ADDRESS!;
  const LAPLOGIC_CORE = process.env.LAPLOGIC_CORE_ADDRESS!;
  const RANK_REGISTRY = process.env.RANK_REGISTRY_ADDRESS!;

  await run('verify:verify', {
    address: GAMECOIN,
    constructorArguments: [60_000_000],
  });

  await run('verify:verify', {
    address: LAPLOGIC_CORE,
    constructorArguments: [GAMECOIN, 3000, 10],
  });

  await run('verify:verify', {
    address: RANK_REGISTRY,
    constructorArguments: [],
  });

  console.log('All contracts verified on Polygonscan');
}

main().catch(console.error);
