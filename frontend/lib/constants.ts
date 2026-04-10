export const DRIVERS = [
  { id: 'VER', name: 'Max Verstappen', team: 'red_bull', teamName: 'Red Bull', price: 14_000_000, number: 1, nationality: 'NLD' },
  { id: 'PER', name: 'Sergio Perez',   team: 'red_bull', teamName: 'Red Bull', price: 9_000_000, number: 11, nationality: 'MEX' },
  { id: 'LEC', name: 'Charles Leclerc', team: 'ferrari', teamName: 'Ferrari', price: 12_000_000, number: 16, nationality: 'MON' },
  { id: 'SAI', name: 'Carlos Sainz',   team: 'ferrari', teamName: 'Ferrari', price: 11_000_000, number: 55, nationality: 'ESP' },
  { id: 'NOR', name: 'Lando Norris',   team: 'mclaren', teamName: 'McLaren', price: 11_000_000, number: 4, nationality: 'GBR' },
  { id: 'PIA', name: 'Oscar Piastri',  team: 'mclaren', teamName: 'McLaren', price: 9_500_000, number: 81, nationality: 'AUS' },
  { id: 'HAM', name: 'Lewis Hamilton', team: 'mercedes', teamName: 'Mercedes', price: 12_000_000, number: 44, nationality: 'GBR' },
  { id: 'RUS', name: 'George Russell', team: 'mercedes', teamName: 'Mercedes', price: 10_000_000, number: 63, nationality: 'GBR' },
  { id: 'ALO', name: 'Fernando Alonso', team: 'aston_martin', teamName: 'Aston Martin', price: 9_000_000, number: 14, nationality: 'ESP' },
  { id: 'STR', name: 'Lance Stroll',   team: 'aston_martin', teamName: 'Aston Martin', price: 6_000_000, number: 18, nationality: 'CAN' },
  { id: 'GAS', name: 'Pierre Gasly',   team: 'alpine', teamName: 'Alpine', price: 7_000_000, number: 10, nationality: 'FRA' },
  { id: 'OCO', name: 'Esteban Ocon',   team: 'alpine', teamName: 'Alpine', price: 6_500_000, number: 31, nationality: 'FRA' },
  { id: 'TSU', name: 'Yuki Tsunoda',   team: 'rb', teamName: 'RB', price: 6_000_000, number: 22, nationality: 'JPN' },
  { id: 'RIC', name: 'Daniel Ricciardo', team: 'rb', teamName: 'RB', price: 6_000_000, number: 3, nationality: 'AUS' },
  { id: 'BOT', name: 'Valtteri Bottas', team: 'kick_sauber', teamName: 'Kick Sauber', price: 5_500_000, number: 77, nationality: 'FIN' },
  { id: 'ZHO', name: 'Guanyu Zhou',    team: 'kick_sauber', teamName: 'Kick Sauber', price: 5_000_000, number: 24, nationality: 'CHN' },
  { id: 'MAG', name: 'Kevin Magnussen', team: 'haas', teamName: 'Haas', price: 5_500_000, number: 20, nationality: 'DNK' },
  { id: 'HUL', name: 'Nico Hulkenberg', team: 'haas', teamName: 'Haas', price: 5_500_000, number: 27, nationality: 'DEU' },
  { id: 'ALB', name: 'Alexander Albon', team: 'williams', teamName: 'Williams', price: 6_500_000, number: 23, nationality: 'THA' },
  { id: 'SAR', name: 'Logan Sargeant', team: 'williams', teamName: 'Williams', price: 4_500_000, number: 2, nationality: 'USA' },
];

export const CONSTRUCTORS = [
  { id: 'red_bull',      name: 'Red Bull Racing', price: 15_000_000, color: '#3671C6' },
  { id: 'ferrari',       name: 'Ferrari',         price: 13_000_000, color: '#E8002D' },
  { id: 'mercedes',      name: 'Mercedes',        price: 12_000_000, color: '#27F4D2' },
  { id: 'mclaren',       name: 'McLaren',         price: 11_000_000, color: '#FF8000' },
  { id: 'aston_martin',  name: 'Aston Martin',    price: 8_000_000,  color: '#229971' },
  { id: 'alpine',        name: 'Alpine',          price: 6_000_000,  color: '#0093CC' },
  { id: 'rb',            name: 'RB',              price: 5_500_000,  color: '#6692FF' },
  { id: 'kick_sauber',   name: 'Kick Sauber',     price: 4_500_000,  color: '#52E252' },
  { id: 'haas',          name: 'Haas',            price: 4_500_000,  color: '#B6BABD' },
  { id: 'williams',      name: 'Williams',        price: 4_000_000,  color: '#64C4FF' },
];

export const COST_CAP = 60_000_000;

export const RANKS = [
  { rank: 1,  name: 'P10 / Points Hunter',    minPoints: 0    },
  { rank: 2,  name: 'Lower Midfield',          minPoints: 50   },
  { rank: 3,  name: 'Upper Midfield',          minPoints: 150  },
  { rank: 4,  name: 'Q2 Merchant',             minPoints: 300  },
  { rank: 5,  name: 'Q3 Regular',              minPoints: 500  },
  { rank: 6,  name: 'Podium Threat',           minPoints: 750  },
  { rank: 7,  name: 'Race Winner',             minPoints: 1000 },
  { rank: 8,  name: 'Title Contender',         minPoints: 1300 },
  { rank: 9,  name: 'Pole Position Machine',   minPoints: 1600 },
  { rank: 10, name: 'World Champion Tier',     minPoints: 1900 },
];