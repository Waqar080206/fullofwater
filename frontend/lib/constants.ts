export const DRIVERS = [
  { id: 'NOR', name: 'Lando Norris', team: 'mclaren', teamName: 'McLaren', price: 15_000_000, number: 1, nationality: 'GBR', imageUrl: '/drivers/lando-norris-f1-driver-profile-picture.webp' },
  { id: 'PIA', name: 'Oscar Piastri', team: 'mclaren', teamName: 'McLaren', price: 14_000_000, number: 81, nationality: 'AUS', imageUrl: '/drivers/oscar-piastri-f1-driver-profile-picture.webp' },
  
  { id: 'RUS', name: 'George Russell', team: 'mercedes', teamName: 'Mercedes', price: 13_500_000, number: 63, nationality: 'GBR', imageUrl: '/drivers/george-russell-f1-driver-profile-picture.webp' },
  { id: 'ANT', name: 'Andrea Kimi Antonelli', team: 'mercedes', teamName: 'Mercedes', price: 10_000_000, number: 12, nationality: 'ITA', imageUrl: '/drivers/kimi-antonelli-f1-driver-profile-picture.webp' },
  
  { id: 'LEC', name: 'Charles Leclerc', team: 'ferrari', teamName: 'Ferrari', price: 14_500_000, number: 16, nationality: 'MON', imageUrl: '/drivers/charles-leclerc-f1-driver-profile-picture.webp' },
  { id: 'HAM', name: 'Lewis Hamilton', team: 'ferrari', teamName: 'Ferrari', price: 14_000_000, number: 44, nationality: 'GBR', imageUrl: '/drivers/lewis-hamilton-f1-driver-profile-picture.webp' },
  
  { id: 'VER', name: 'Max Verstappen', team: 'red_bull', teamName: 'Red Bull Racing', price: 15_500_000, number: 3, nationality: 'NLD', imageUrl: '/drivers/max-verstappen-f1-driver-profile-picture.webp' },
  { id: 'HAD', name: 'Isack Hadjar', team: 'red_bull', teamName: 'Red Bull Racing', price: 9_500_000, number: 6, nationality: 'FRA', imageUrl: '/drivers/isack-hadjar-f1-driver-profile-picture.webp' },
  
  { id: 'ALO', name: 'Fernando Alonso', team: 'aston_martin', teamName: 'Aston Martin', price: 11_000_000, number: 14, nationality: 'ESP', imageUrl: '/drivers/fernando-alonso-f1-driver-profile-picture.webp' },
  { id: 'STR', name: 'Lance Stroll', team: 'aston_martin', teamName: 'Aston Martin', price: 8_500_000, number: 18, nationality: 'CAN', imageUrl: '/drivers/lance-stroll-f1-driver-profile-picture.webp' },
  
  { id: 'ALB', name: 'Alex Albon', team: 'williams', teamName: 'Williams', price: 10_500_000, number: 23, nationality: 'THA', imageUrl: '/drivers/alex-albon-f1-driver-profile-picture.webp' },
  { id: 'SAI', name: 'Carlos Sainz', team: 'williams', teamName: 'Williams', price: 12_000_000, number: 55, nationality: 'ESP', imageUrl: '/drivers/carlos-sainz-f1-driver-profile-picture.webp' },
  
  { id: 'HUL', name: 'Nico Hülkenberg', team: 'audi', teamName: 'Audi', price: 9_500_000, number: 27, nationality: 'DEU', imageUrl: '/drivers/nico-hulkenberg-f1-driver-profile-picture.webp' },
  { id: 'BOR', name: 'Gabriel Bortoleto', team: 'audi', teamName: 'Audi', price: 8_000_000, number: 5, nationality: 'BRA', imageUrl: '/drivers/gabriel-bortoleto-f1-driver-profile-picture.webp' },
  
  { id: 'GAS', name: 'Pierre Gasly', team: 'alpine', teamName: 'Alpine', price: 9_000_000, number: 10, nationality: 'FRA', imageUrl: '/drivers/pierre-gasly-f1-driver-profile-picture.webp' },
  { id: 'COL', name: 'Franco Colapinto', team: 'alpine', teamName: 'Alpine', price: 9_000_000, number: 43, nationality: 'ARG', imageUrl: '/drivers/franco-colapinto-f1-driver-profile-picture.webp' },
  
  { id: 'OCO', name: 'Esteban Ocon', team: 'haas', teamName: 'Haas', price: 9_000_000, number: 31, nationality: 'FRA', imageUrl: '/drivers/esteban-ocon-f1-driver-profile-picture.webp' },
  { id: 'BEA', name: 'Oliver Bearman', team: 'haas', teamName: 'Haas', price: 8_500_000, number: 87, nationality: 'GBR', imageUrl: '/drivers/oliver-bearman-f1-driver-profile-picture.webp' },
  
  { id: 'LAW', name: 'Liam Lawson', team: 'rb', teamName: 'Racing Bulls (RB)', price: 9_000_000, number: 30, nationality: 'NZL', imageUrl: '/drivers/liam-lawson-f1-driver-profile-picture.webp' },
  { id: 'LIN', name: 'Arvid Lindblad', team: 'rb', teamName: 'Racing Bulls (RB)', price: 7_500_000, number: 41, nationality: 'GBR', imageUrl: '/drivers/arvid-lindblad-f1-driver-profile-picture.webp' },
  
  { id: 'PER', name: 'Sergio Pérez', team: 'cadillac', teamName: 'Cadillac', price: 10_000_000, number: 11, nationality: 'MEX', imageUrl: '/drivers/sergio-perez-f1-driver-profile-picture.webp' },
  { id: 'BOT', name: 'Valtteri Bottas', team: 'cadillac', teamName: 'Cadillac', price: 8_500_000, number: 77, nationality: 'FIN', imageUrl: '/drivers/valtteri-bottas-f1-driver-profile-picture.webp' },
];

export const CONSTRUCTORS = [
  { id: 'mclaren',       name: 'McLaren',         price: 18_000_000, color: '#FF8000', imageUrl: '/constructors/mclaren.webp' },
  { id: 'ferrari',       name: 'Ferrari',         price: 16_500_000, color: '#E8002D', imageUrl: '/constructors/ferrari.webp' },
  { id: 'mercedes',      name: 'Mercedes',        price: 15_000_000, color: '#27F4D2', imageUrl: '/constructors/mercedes.webp' },
  { id: 'red_bull',      name: 'Red Bull Racing', price: 14_000_000, color: '#3671C6', imageUrl: '/constructors/red-bull-racing.webp' },
  { id: 'aston_martin',  name: 'Aston Martin',    price: 10_000_000, color: '#229971', imageUrl: '/constructors/aston-martin.webp' },
  { id: 'williams',      name: 'Williams',        price: 9_000_000,  color: '#64C4FF', imageUrl: '/constructors/williams.webp' },
  { id: 'alpine',        name: 'Alpine',          price: 7_500_000,  color: '#FF87BC', imageUrl: '/constructors/alpine.webp' },
  { id: 'audi',          name: 'Audi',            price: 7_000_000,  color: '#F40A0A', imageUrl: '/constructors/audi.webp' },
  { id: 'haas',          name: 'Haas',            price: 6_500_000,  color: '#B6BABD', imageUrl: '/constructors/haas-f1-team.webp' },
  { id: 'rb',            name: 'Racing Bulls',    price: 6_000_000,  color: '#6692FF', imageUrl: '/constructors/racing-bulls.webp' },
  { id: 'cadillac',      name: 'Cadillac',        price: 5_000_000,  color: '#FFCC00', imageUrl: '/constructors/cadillac.webp' },
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