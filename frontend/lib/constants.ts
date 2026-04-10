export const DRIVERS = [
  { id: 'NOR', name: 'Lando Norris', team: 'mclaren', teamName: 'McLaren', price: 15_000_000, number: 1, nationality: 'GBR', imageUrl: '/drivers/norris.png' },
  { id: 'PIA', name: 'Oscar Piastri', team: 'mclaren', teamName: 'McLaren', price: 14_000_000, number: 81, nationality: 'AUS', imageUrl: '/drivers/piastri.png' },
  
  { id: 'RUS', name: 'George Russell', team: 'mercedes', teamName: 'Mercedes', price: 13_500_000, number: 63, nationality: 'GBR', imageUrl: '/drivers/russell.png' },
  { id: 'ANT', name: 'Andrea Kimi Antonelli', team: 'mercedes', teamName: 'Mercedes', price: 10_000_000, number: 12, nationality: 'ITA', imageUrl: '/drivers/antonelli.png' },
  
  { id: 'LEC', name: 'Charles Leclerc', team: 'ferrari', teamName: 'Ferrari', price: 14_500_000, number: 16, nationality: 'MON', imageUrl: '/drivers/leclerc.png' },
  { id: 'HAM', name: 'Lewis Hamilton', team: 'ferrari', teamName: 'Ferrari', price: 14_000_000, number: 44, nationality: 'GBR', imageUrl: '/drivers/hamilton.png' },
  
  { id: 'VER', name: 'Max Verstappen', team: 'red_bull', teamName: 'Red Bull Racing', price: 15_500_000, number: 3, nationality: 'NLD', imageUrl: '/drivers/verstappen.png' },
  { id: 'HAD', name: 'Isack Hadjar', team: 'red_bull', teamName: 'Red Bull Racing', price: 9_500_000, number: 6, nationality: 'FRA', imageUrl: '/drivers/hadjar.png' },
  
  { id: 'ALO', name: 'Fernando Alonso', team: 'aston_martin', teamName: 'Aston Martin', price: 11_000_000, number: 14, nationality: 'ESP', imageUrl: '/drivers/alonso.png' },
  { id: 'STR', name: 'Lance Stroll', team: 'aston_martin', teamName: 'Aston Martin', price: 8_500_000, number: 18, nationality: 'CAN', imageUrl: '/drivers/stroll.png' },
  
  { id: 'ALB', name: 'Alex Albon', team: 'williams', teamName: 'Williams', price: 10_500_000, number: 23, nationality: 'THA', imageUrl: '/drivers/albon.png' },
  { id: 'SAI', name: 'Carlos Sainz', team: 'williams', teamName: 'Williams', price: 12_000_000, number: 55, nationality: 'ESP', imageUrl: '/drivers/sainz.png' },
  
  { id: 'HUL', name: 'Nico Hülkenberg', team: 'audi', teamName: 'Audi', price: 9_500_000, number: 27, nationality: 'DEU', imageUrl: '/drivers/hulkenberg.png' },
  { id: 'BOR', name: 'Gabriel Bortoleto', team: 'audi', teamName: 'Audi', price: 8_000_000, number: 5, nationality: 'BRA', imageUrl: '/drivers/bortoleto.png' },
  
  { id: 'GAS', name: 'Pierre Gasly', team: 'alpine', teamName: 'Alpine', price: 9_000_000, number: 10, nationality: 'FRA', imageUrl: '/drivers/gasly.png' },
  { id: 'COL', name: 'Franco Colapinto', team: 'alpine', teamName: 'Alpine', price: 9_000_000, number: 43, nationality: 'ARG', imageUrl: '/drivers/colapinto.png' },
  
  { id: 'OCO', name: 'Esteban Ocon', team: 'haas', teamName: 'Haas', price: 9_000_000, number: 31, nationality: 'FRA', imageUrl: '/drivers/ocon.png' },
  { id: 'BEA', name: 'Oliver Bearman', team: 'haas', teamName: 'Haas', price: 8_500_000, number: 87, nationality: 'GBR', imageUrl: '/drivers/bearman.png' },
  
  { id: 'LAW', name: 'Liam Lawson', team: 'rb', teamName: 'Racing Bulls (RB)', price: 9_000_000, number: 30, nationality: 'NZL', imageUrl: '/drivers/lawson.png' },
  { id: 'LIN', name: 'Arvid Lindblad', team: 'rb', teamName: 'Racing Bulls (RB)', price: 7_500_000, number: 41, nationality: 'GBR', imageUrl: '/drivers/lindblad.png' },
  
  { id: 'PER', name: 'Sergio Pérez', team: 'cadillac', teamName: 'Cadillac', price: 10_000_000, number: 11, nationality: 'MEX', imageUrl: '/drivers/perez.png' },
  { id: 'BOT', name: 'Valtteri Bottas', team: 'cadillac', teamName: 'Cadillac', price: 8_500_000, number: 77, nationality: 'FIN', imageUrl: '/drivers/bottas.png' },
];

export const CONSTRUCTORS = [
  { id: 'mclaren',       name: 'McLaren',         price: 18_000_000, color: '#FF8000', imageUrl: '/teams/mclaren.png' },
  { id: 'ferrari',       name: 'Ferrari',         price: 16_500_000, color: '#E8002D', imageUrl: '/teams/ferrari.png' },
  { id: 'mercedes',      name: 'Mercedes',        price: 15_000_000, color: '#27F4D2', imageUrl: '/teams/mercedes.png' },
  { id: 'red_bull',      name: 'Red Bull Racing', price: 14_000_000, color: '#3671C6', imageUrl: '/teams/red_bull.png' },
  { id: 'aston_martin',  name: 'Aston Martin',    price: 10_000_000, color: '#229971', imageUrl: '/teams/aston_martin.png' },
  { id: 'williams',      name: 'Williams',        price: 9_000_000,  color: '#64C4FF', imageUrl: '/teams/williams.png' },
  { id: 'alpine',        name: 'Alpine',          price: 7_500_000,  color: '#FF87BC', imageUrl: '/teams/alpine.png' },
  { id: 'audi',          name: 'Audi',            price: 7_000_000,  color: '#F40A0A', imageUrl: '/teams/audi.png' },
  { id: 'haas',          name: 'Haas',            price: 6_500_000,  color: '#B6BABD', imageUrl: '/teams/haas.png' },
  { id: 'rb',            name: 'Racing Bulls',    price: 6_000_000,  color: '#6692FF', imageUrl: '/teams/rb.png' },
  { id: 'cadillac',      name: 'Cadillac',        price: 5_000_000,  color: '#FFCC00', imageUrl: '/teams/cadillac.png' },
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