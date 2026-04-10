interface DriverResult {
  driverId: string;
  position: number;
  points: number;
  fastestLap: boolean;
  dnf: boolean;
  overtakes: number;
  qualifyingPosition: number;
}

const POSITION_POINTS: Record<number, number> = {
  1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
  6: 8, 7: 6, 8: 4, 9: 2, 10: 1,
};

const QUALI_BONUS: Record<number, number> = {
  1: 5, 2: 3, 3: 2,
};

export function calculateDriverPoints(result: DriverResult): number {
  let pts = 0;
  if (result.dnf) {
    pts -= 5;
  } else {
    pts += POSITION_POINTS[result.position] || 0;
  }
  pts += QUALI_BONUS[result.qualifyingPosition] || (result.qualifyingPosition <= 10 ? 1 : 0);
  if (result.fastestLap) pts += 3;
  pts += result.overtakes;
  return pts;
}

export function calculateConstructorPoints(driverResults: DriverResult[]): number {
  return driverResults.reduce((sum, d) => {
    return sum + (POSITION_POINTS[d.position] || 0);
  }, 0);
}

export function calculateTeamPoints(
  drivers: string[],
  constructor: string,
  allResults: DriverResult[]
): number {
  const driverResultsMap = new Map(allResults.map(r => [r.driverId, r]));
  let total = 0;
  for (const driverId of drivers) {
    const result = driverResultsMap.get(driverId);
    if (result) total += calculateDriverPoints(result);
  }
  const constructorDrivers = allResults.filter(r =>
    r.driverId.startsWith(constructor)  // naming convention: constructorId_driver1, constructorId_driver2
  );
  total += calculateConstructorPoints(constructorDrivers);
  return total;
}

// Rank names by cumulative points thresholds (seasonal)
export const RANK_THRESHOLDS = [
  { min: 0,    max: 49,   rank: 1,  name: 'P10 / Points Hunter' },
  { min: 50,   max: 149,  rank: 2,  name: 'Lower Midfield' },
  { min: 150,  max: 299,  rank: 3,  name: 'Upper Midfield' },
  { min: 300,  max: 499,  rank: 4,  name: 'Q2 Merchant' },
  { min: 500,  max: 749,  rank: 5,  name: 'Q3 Regular' },
  { min: 750,  max: 999,  rank: 6,  name: 'Podium Threat' },
  { min: 1000, max: 1299, rank: 7,  name: 'Race Winner' },
  { min: 1300, max: 1599, rank: 8,  name: 'Title Contender' },
  { min: 1600, max: 1899, rank: 9,  name: 'Pole Position Machine' },
  { min: 1900, max: Infinity, rank: 10, name: 'World Champion Tier' },
];

export function getRankFromPoints(totalPoints: number): { rank: number; rankName: string } {
  const tier = RANK_THRESHOLDS.find(t => totalPoints >= t.min && totalPoints <= t.max);
  return tier ? { rank: tier.rank, rankName: tier.name } : { rank: 1, rankName: 'P10 / Points Hunter' };
}