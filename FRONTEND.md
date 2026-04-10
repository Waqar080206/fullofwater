# FRONTEND.md — OffGrid F1 Fantasy Platform

## Overview

Next.js 14 App Router frontend. Dark, cinematic F1 aesthetic — think telemetry dashboards, carbon fiber textures, speed. Wallet connection via MetaMask/ethers.js. JWT stored in localStorage after wallet auth. All data from backend REST API.

---

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom CSS variables
- **Blockchain**: Ethers.js v6
- **State**: React Context (AuthContext, WalletContext)
- **HTTP**: Axios or native fetch with typed wrappers
- **Fonts**: `Orbitron` (headings/numbers — F1-style), `Inter` (body)
- **Icons**: Lucide React

---

## Design System

### Color Palette (CSS Variables in `globals.css`)

```css
:root {
  --bg-primary: #0a0a0a;        /* Near black */
  --bg-secondary: #111111;      /* Card background */
  --bg-tertiary: #1a1a1a;       /* Elevated surfaces */
  --accent-red: #e8002d;        /* F1 red */
  --accent-red-dim: #8b0018;    /* Muted red */
  --accent-gold: #ffd700;       /* Podium gold */
  --accent-silver: #c0c0c0;     /* P2 silver */
  --accent-bronze: #cd7f32;     /* P3 bronze */
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-muted: #555555;
  --border: #2a2a2a;
  --border-accent: #e8002d33;
  --success: #00d4aa;
  --warning: #ffaa00;
  --danger: #ff4444;
}
```

### Typography

```css
/* globals.css — import from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap');

.font-display { font-family: 'Orbitron', monospace; }
.font-body    { font-family: 'Inter', sans-serif; }
```

---

## Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── globals.css             # CSS variables, base styles
│   ├── page.tsx                # Landing page
│   ├── dashboard/
│   │   └── page.tsx            # Race calendar + user overview
│   ├── team/
│   │   └── page.tsx            # Team builder (pick drivers + constructor)
│   ├── race/
│   │   └── [raceId]/
│   │       └── page.tsx        # Race weekend: results, standings, predict
│   ├── predict/
│   │   └── [raceId]/
│   │       └── page.tsx        # Prediction betting UI
│   ├── leaderboard/
│   │   └── page.tsx            # Global leaderboard
│   └── profile/
│       └── page.tsx            # User stats, rank, history
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── wallet/
│   │   ├── ConnectButton.tsx
│   │   └── WalletModal.tsx
│   ├── team/
│   │   ├── DriverCard.tsx
│   │   ├── ConstructorCard.tsx
│   │   ├── CostCapBar.tsx
│   │   └── TeamBuilder.tsx
│   ├── prediction/
│   │   ├── PredictionCard.tsx
│   │   └── BetSlider.tsx
│   ├── leaderboard/
│   │   └── LeaderboardTable.tsx
│   ├── race/
│   │   ├── RaceCard.tsx
│   │   └── ResultsTable.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Loader.tsx
├── context/
│   ├── AuthContext.tsx
│   └── WalletContext.tsx
├── lib/
│   ├── api.ts                  # All backend API calls
│   ├── ethers.ts               # Wallet + contract helpers
│   ├── constants.ts            # Drivers, constructors, scoring
│   └── utils.ts                # formatCoins, shortenAddress, etc.
├── public/
│   └── (team logos, circuit images)
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Context

### `context/WalletContext.tsx`

```typescript
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';

interface WalletContextType {
  address: string | null;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null, signer: null, provider: null, isConnecting: false,
  connect: async () => {}, disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Auto-reconnect if wallet was previously connected
    const savedAddress = localStorage.getItem('offgrid_wallet');
    if (savedAddress && window.ethereum) {
      connect();
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      alert('MetaMask not found. Please install MetaMask.');
      return;
    }
    setIsConnecting(true);
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      await _provider.send('eth_requestAccounts', []);

      // Switch to Polygon Amoy if needed
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13882' }], // 80002 in hex = Polygon Amoy
        });
      } catch (switchError: any) {
        // Chain not added — add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x13882',
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
              rpcUrls: ['https://rpc-amoy.polygon.technology'],
              blockExplorerUrls: ['https://amoy.polygonscan.com'],
            }],
          });
        }
      }

      const _signer = await _provider.getSigner();
      const _address = await _signer.getAddress();

      setProvider(_provider);
      setSigner(_signer);
      setAddress(_address);
      localStorage.setItem('offgrid_wallet', _address);
    } catch (err) {
      console.error('Wallet connect failed', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
    localStorage.removeItem('offgrid_wallet');
    localStorage.removeItem('offgrid_token');
  };

  return (
    <WalletContext.Provider value={{ address, signer, provider, isConnecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
```

---

### `context/AuthContext.tsx`

```typescript
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { authAPI } from '../lib/api';

interface User {
  _id: string;
  walletAddress: string;
  username: string;
  totalPoints: number;
  rank: number;
  rankName: string;
  gameCoins: number;
  tier: 'free' | 'paid';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null, isLoading: false,
  login: async () => {}, logout: () => {}, refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, signer } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('offgrid_token');
    if (savedToken) {
      setToken(savedToken);
      // Optionally decode and set user from token or fetch /me endpoint
    }
  }, []);

  const login = async () => {
    if (!address || !signer) return;
    setIsLoading(true);
    try {
      // 1. Get nonce
      const { nonce } = await authAPI.getNonce(address);
      // 2. Sign nonce
      const signature = await signer.signMessage(nonce);
      // 3. Verify and get JWT
      const { token: jwt, user: userData } = await authAPI.verify(address, signature, nonce);
      setToken(jwt);
      setUser(userData);
      localStorage.setItem('offgrid_token', jwt);
    } catch (err) {
      console.error('Login failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('offgrid_token');
  };

  const refreshUser = async () => {
    // Fetch updated user data from backend
    // Implement GET /api/auth/me endpoint or decode from token
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## API Layer: `lib/api.ts`

All backend calls go through typed functions here. Base URL from env.

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getHeaders(token?: string | null) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  method: string,
  path: string,
  body?: object,
  token?: string | null
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Auth
export const authAPI = {
  getNonce: (address: string) => request<{ nonce: string }>('GET', `/auth/nonce/${address}`),
  verify: (address: string, signature: string, nonce: string, username?: string) =>
    request<{ token: string; user: any }>('POST', '/auth/verify', { address, signature, nonce, username }),
};

// Races
export const raceAPI = {
  getAll: () => request<any[]>('GET', '/race'),
  getById: (id: string) => request<any>('GET', `/race/${id}`),
};

// Teams
export const teamAPI = {
  get: (raceId: string, token: string) => request<any>('GET', `/team/${raceId}`, undefined, token),
  create: (data: any, token: string) => request<any>('POST', '/team', data, token),
  update: (raceId: string, data: any, token: string) => request<any>('PUT', `/team/${raceId}`, data, token),
};

// Predictions
export const predictionAPI = {
  getByRace: (raceId: string, token: string) => request<any[]>('GET', `/prediction/${raceId}`, undefined, token),
  placeBet: (data: any, token: string) => request<any>('POST', '/prediction/bet', data, token),
};

// Leaderboard
export const leaderboardAPI = {
  get: (limit?: number) => request<any[]>('GET', `/leaderboard?limit=${limit || 50}`),
};
```

---

## Ethers.js Helpers: `lib/ethers.ts`

```typescript
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
```

---

## Constants: `lib/constants.ts`

```typescript
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
```

---

## Pages

### `app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from '../context/WalletContext';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

export const metadata: Metadata = {
  title: 'OffGrid — F1 Fantasy on Chain',
  description: 'Build your F1 fantasy team, predict race outcomes, earn on-chain.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white font-body min-h-screen">
        <WalletProvider>
          <AuthProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
          </AuthProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
```

---

### `app/page.tsx` — Landing Page

```typescript
// Full dark cinematic landing page
// Sections:
// 1. Hero — "BUILD YOUR GRID. EARN ON CHAIN." with animated speed lines
// 2. How It Works — 3 steps: Connect Wallet → Pick Your Team → Earn GameCoins
// 3. Features — Prediction markets, live leaderboard, rank system
// 4. CTA — "Join the Grid" button → /dashboard

'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import ConnectButton from '../components/wallet/ConnectButton';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { address } = useWallet();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background: diagonal red speed lines */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#110008] to-[#0a0a0a]" />
      <div className="absolute inset-0 opacity-10"
           style={{ backgroundImage: 'repeating-linear-gradient(65deg, #e8002d 0px, #e8002d 1px, transparent 1px, transparent 60px)' }} />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4">
        <p className="font-display text-[#e8002d] text-sm tracking-[0.4em] uppercase mb-4">
          Season 2025 · On Polygon
        </p>
        <h1 className="font-display font-black text-6xl md:text-8xl leading-none mb-6">
          BUILD YOUR<br />
          <span className="text-[#e8002d]">GRID.</span><br />
          EARN ON CHAIN.
        </h1>
        <p className="text-[#a0a0a0] text-lg max-w-xl mb-10">
          Pick 3 drivers and a constructor under a 60M GameCoin cap.
          Predict race outcomes. Climb the ranks. Redeem to ETH.
        </p>
        {address ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#e8002d] hover:bg-[#ff1a3e] text-white font-display font-bold text-sm tracking-widest uppercase px-10 py-4 transition-all"
          >
            Enter the Grid →
          </button>
        ) : (
          <ConnectButton />
        )}
      </section>

      {/* How It Works */}
      <section className="relative py-24 px-4 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-center mb-16">
          HOW IT <span className="text-[#e8002d]">WORKS</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Connect Wallet', desc: 'Sign in with MetaMask. No password. No email. Just your wallet.' },
            { step: '02', title: 'Build Your Team', desc: 'Pick 3 drivers + 1 constructor under 60M GameCoins. Lock before qualifying.' },
            { step: '03', title: 'Earn GameCoins', desc: 'Score fantasy points, win prediction bets, climb ranks, redeem to ETH.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="border border-[#2a2a2a] p-8 hover:border-[#e8002d33] transition-colors">
              <p className="font-display text-[#e8002d] text-5xl font-black mb-4">{step}</p>
              <h3 className="font-display font-bold text-xl mb-3">{title}</h3>
              <p className="text-[#a0a0a0] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

### `app/dashboard/page.tsx` — Race Calendar

```typescript
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { raceAPI } from '../../lib/api';
import RaceCard from '../../components/race/RaceCard';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const [races, setRaces] = useState<any[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    raceAPI.getAll().then(setRaces);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* User overview strip */}
      {user && (
        <div className="flex items-center justify-between border border-[#2a2a2a] p-6 mb-12">
          <div>
            <p className="text-[#a0a0a0] text-sm">PILOT</p>
            <p className="font-display font-bold text-2xl">{user.username}</p>
          </div>
          <div className="text-center">
            <p className="text-[#a0a0a0] text-sm">RANK</p>
            <p className="font-display font-bold text-[#e8002d]">{user.rankName}</p>
          </div>
          <div className="text-center">
            <p className="text-[#a0a0a0] text-sm">POINTS</p>
            <p className="font-display font-bold text-2xl">{user.totalPoints}</p>
          </div>
          <div className="text-center">
            <p className="text-[#a0a0a0] text-sm">GAMECOINS</p>
            <p className="font-display font-bold text-[#ffd700] text-2xl">
              {(user.gameCoins / 1_000_000).toFixed(1)}M
            </p>
          </div>
        </div>
      )}

      <h2 className="font-display font-bold text-2xl mb-8">
        2025 <span className="text-[#e8002d]">RACE CALENDAR</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {races.map(race => (
          <RaceCard
            key={race._id}
            race={race}
            onClick={() => router.push(`/race/${race._id}`)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

### `app/team/page.tsx` — Team Builder

```typescript
// Full team builder UI
// - Show all 20 drivers as cards with price
// - Show all 10 constructors
// - Track selected 3 drivers + 1 constructor
// - Live cost cap bar: spend/60M
// - Validate: 3 drivers exactly, 1 constructor, totalCost <= 60M
// - Submit to POST /api/team

'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DRIVERS, CONSTRUCTORS, COST_CAP } from '../../lib/constants';
import DriverCard from '../../components/team/DriverCard';
import ConstructorCard from '../../components/team/ConstructorCard';
import CostCapBar from '../../components/team/CostCapBar';
import { teamAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function TeamBuilderPage() {
  const searchParams = useSearchParams();
  const raceId = searchParams.get('raceId');
  const router = useRouter();
  const { token } = useAuth();

  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedConstructor, setSelectedConstructor] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = [
    ...selectedDrivers.map(id => DRIVERS.find(d => d.id === id)?.price || 0),
    selectedConstructor ? (CONSTRUCTORS.find(c => c.id === selectedConstructor)?.price || 0) : 0,
  ].reduce((a, b) => a + b, 0);

  const toggleDriver = (id: string) => {
    setSelectedDrivers(prev => {
      if (prev.includes(id)) return prev.filter(d => d !== id);
      if (prev.length >= 3) return prev; // max 3
      const newCost = totalCost + (DRIVERS.find(d => d.id === id)?.price || 0);
      if (newCost > COST_CAP) { setError('Over cost cap!'); return prev; }
      setError(null);
      return [...prev, id];
    });
  };

  const selectConstructor = (id: string) => {
    const newCost = totalCost - (selectedConstructor ? CONSTRUCTORS.find(c => c.id === selectedConstructor)?.price || 0 : 0)
                   + (CONSTRUCTORS.find(c => c.id === id)?.price || 0);
    if (newCost > COST_CAP) { setError('Over cost cap!'); return; }
    setError(null);
    setSelectedConstructor(prev => prev === id ? null : id);
  };

  const handleSubmit = async () => {
    if (!raceId || !token) return;
    if (selectedDrivers.length !== 3) { setError('Select exactly 3 drivers'); return; }
    if (!selectedConstructor) { setError('Select a constructor'); return; }

    setIsSubmitting(true);
    try {
      await teamAPI.create({
        raceId,
        drivers: selectedDrivers,
        constructor: selectedConstructor,
        totalCost,
      }, token);
      router.push(`/race/${raceId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl">
          BUILD YOUR <span className="text-[#e8002d]">TEAM</span>
        </h1>
        <CostCapBar spent={totalCost} cap={COST_CAP} />
      </div>

      {error && (
        <div className="border border-[#ff4444] bg-[#ff444411] text-[#ff4444] px-4 py-3 mb-6 text-sm font-display">
          {error}
        </div>
      )}

      {/* Status summary */}
      <div className="flex gap-6 mb-8 text-sm font-display">
        <span>Drivers: <span className={selectedDrivers.length === 3 ? 'text-[#00d4aa]' : 'text-[#e8002d]'}>{selectedDrivers.length}/3</span></span>
        <span>Constructor: <span className={selectedConstructor ? 'text-[#00d4aa]' : 'text-[#e8002d]'}>{selectedConstructor ? '✓' : '0/1'}</span></span>
        <span>Remaining: <span className="text-[#ffd700]">{((COST_CAP - totalCost) / 1_000_000).toFixed(1)}M</span></span>
      </div>

      {/* Drivers grid */}
      <h2 className="font-display text-xl font-bold mb-4">SELECT 3 DRIVERS</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
        {DRIVERS.map(driver => (
          <DriverCard
            key={driver.id}
            driver={driver}
            isSelected={selectedDrivers.includes(driver.id)}
            isDisabled={selectedDrivers.length >= 3 && !selectedDrivers.includes(driver.id)}
            onClick={() => toggleDriver(driver.id)}
          />
        ))}
      </div>

      {/* Constructors */}
      <h2 className="font-display text-xl font-bold mb-4">SELECT 1 CONSTRUCTOR</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        {CONSTRUCTORS.map(constructor => (
          <ConstructorCard
            key={constructor.id}
            constructor={constructor}
            isSelected={selectedConstructor === constructor.id}
            onClick={() => selectConstructor(constructor.id)}
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || selectedDrivers.length !== 3 || !selectedConstructor}
        className="w-full bg-[#e8002d] hover:bg-[#ff1a3e] disabled:bg-[#2a2a2a] disabled:text-[#555] text-white font-display font-bold tracking-widest uppercase py-4 transition-all"
      >
        {isSubmitting ? 'LOCKING IN...' : 'LOCK IN TEAM →'}
      </button>
    </div>
  );
}
```

---

### `app/predict/[raceId]/page.tsx` — Prediction Betting

```typescript
// Prediction questions list for a race
// Each card: question text, optionA vs optionB buttons, bet slider for GameCoins
// Show multiplier (3x or 4x)
// Submit to POST /api/prediction/bet

'use client';
import { useEffect, useState } from 'react';
import { predictionAPI } from '../../../lib/api';
import PredictionCard from '../../../components/prediction/PredictionCard';
import { useAuth } from '../../../context/AuthContext';

export default function PredictPage({ params }: { params: { raceId: string } }) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token) {
      predictionAPI.getByRace(params.raceId, token).then(setPredictions);
    }
  }, [params.raceId, token]);

  const handleBet = async (predictionId: string, chosenOption: 'A' | 'B', amountStaked: number) => {
    if (!token) return;
    await predictionAPI.placeBet({
      predictionId,
      raceId: params.raceId,
      chosenOption,
      amountStaked,
    }, token);
    // Refresh predictions
    predictionAPI.getByRace(params.raceId, token).then(setPredictions);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display font-bold text-3xl mb-2">
        RACE <span className="text-[#e8002d]">PREDICTIONS</span>
      </h1>
      <p className="text-[#a0a0a0] mb-8 text-sm">
        Spend your remaining GameCoins. Win up to 4x.
      </p>

      <div className="space-y-6">
        {predictions.map(prediction => (
          <PredictionCard
            key={prediction._id}
            prediction={prediction}
            userCoins={user?.gameCoins || 0}
            onBet={handleBet}
          />
        ))}
        {predictions.length === 0 && (
          <p className="text-[#555] text-center py-12 font-display">
            No predictions available for this race yet.
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## Components

### `components/wallet/ConnectButton.tsx`

```typescript
'use client';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';

export default function ConnectButton() {
  const { address, connect, disconnect, isConnecting } = useWallet();
  const { user, login, logout, isLoading } = useAuth();

  if (!address) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="border border-[#e8002d] text-[#e8002d] hover:bg-[#e8002d] hover:text-white font-display font-bold text-sm tracking-widest uppercase px-8 py-3 transition-all disabled:opacity-50"
      >
        {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
      </button>
    );
  }

  if (!user) {
    return (
      <button
        onClick={login}
        disabled={isLoading}
        className="border border-[#e8002d] text-[#e8002d] hover:bg-[#e8002d] hover:text-white font-display font-bold text-sm tracking-widest uppercase px-8 py-3 transition-all"
      >
        {isLoading ? 'SIGNING...' : 'SIGN IN'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="font-display text-sm text-[#a0a0a0]">
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
      <button
        onClick={() => { logout(); disconnect(); }}
        className="border border-[#2a2a2a] text-[#555] hover:border-[#e8002d] hover:text-[#e8002d] font-display text-xs tracking-widest uppercase px-4 py-2 transition-all"
      >
        DISCONNECT
      </button>
    </div>
  );
}
```

---

### `components/team/DriverCard.tsx`

```typescript
interface Driver {
  id: string; name: string; team: string; teamName: string;
  price: number; number: number; nationality: string;
}

interface Props {
  driver: Driver;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export default function DriverCard({ driver, isSelected, isDisabled, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative p-4 text-left border transition-all
        ${isSelected
          ? 'border-[#e8002d] bg-[#e8002d11]'
          : isDisabled
          ? 'border-[#1a1a1a] opacity-40 cursor-not-allowed'
          : 'border-[#2a2a2a] hover:border-[#e8002d55]'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-[#e8002d] rounded-full flex items-center justify-center">
          <span className="text-white text-[8px]">✓</span>
        </div>
      )}
      <p className="font-display font-black text-4xl text-[#1a1a1a] absolute top-2 left-2 select-none">
        {driver.number}
      </p>
      <div className="mt-8">
        <p className="font-display font-bold text-sm leading-tight">{driver.name}</p>
        <p className="text-[#a0a0a0] text-xs mt-1">{driver.teamName}</p>
        <p className="font-display text-[#ffd700] font-bold text-sm mt-3">
          {(driver.price / 1_000_000).toFixed(1)}M
        </p>
      </div>
    </button>
  );
}
```

---

### `components/team/CostCapBar.tsx`

```typescript
interface Props {
  spent: number;
  cap: number;
}

export default function CostCapBar({ spent, cap }: Props) {
  const pct = Math.min((spent / cap) * 100, 100);
  const isOver = spent > cap;
  const isDanger = pct > 85;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2 items-baseline">
        <span className={`font-display font-bold text-lg ${isOver ? 'text-[#ff4444]' : isDanger ? 'text-[#ffaa00]' : 'text-[#ffd700]'}`}>
          {(spent / 1_000_000).toFixed(1)}M
        </span>
        <span className="text-[#555] text-sm">/ 60M</span>
      </div>
      <div className="w-48 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all rounded-full ${isOver ? 'bg-[#ff4444]' : isDanger ? 'bg-[#ffaa00]' : 'bg-[#e8002d]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

---

### `components/prediction/PredictionCard.tsx`

```typescript
'use client';
import { useState } from 'react';

interface Prediction {
  _id: string;
  question: string;
  optionA: string;
  optionB: string;
  multiplierWin: number;
  isSettled: boolean;
  correctOption: 'A' | 'B' | null;
}

interface Props {
  prediction: Prediction;
  userCoins: number;
  onBet: (predictionId: string, option: 'A' | 'B', amount: number) => Promise<void>;
}

export default function PredictionCard({ prediction, userCoins, onBet }: Props) {
  const [chosen, setChosen] = useState<'A' | 'B' | null>(null);
  const [stake, setStake] = useState(1000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  const handleBet = async () => {
    if (!chosen || placed) return;
    setIsSubmitting(true);
    await onBet(prediction._id, chosen, stake);
    setPlaced(true);
    setIsSubmitting(false);
  };

  return (
    <div className="border border-[#2a2a2a] hover:border-[#e8002d33] transition-colors p-6">
      {/* Multiplier badge */}
      <div className="flex justify-between items-start mb-4">
        <p className="text-white font-bold text-base leading-snug max-w-[75%]">
          {prediction.question}
        </p>
        <span className="font-display font-black text-[#ffd700] text-xl ml-4">
          {prediction.multiplierWin}×
        </span>
      </div>

      {prediction.isSettled ? (
        <div className="text-sm font-display">
          <span className="text-[#a0a0a0]">Result: </span>
          <span className="text-[#00d4aa]">
            {prediction.correctOption === 'A' ? prediction.optionA : prediction.optionB}
          </span>
        </div>
      ) : placed ? (
        <div className="text-[#00d4aa] font-display text-sm">BET PLACED ✓</div>
      ) : (
        <>
          {/* Option buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(['A', 'B'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setChosen(opt)}
                className={`py-3 px-4 text-sm font-bold border transition-all ${
                  chosen === opt
                    ? 'border-[#e8002d] bg-[#e8002d] text-white'
                    : 'border-[#2a2a2a] text-[#a0a0a0] hover:border-[#e8002d55]'
                }`}
              >
                {opt === 'A' ? prediction.optionA : prediction.optionB}
              </button>
            ))}
          </div>

          {/* Stake slider */}
          {chosen && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-[#a0a0a0] mb-2">
                <span>STAKE</span>
                <span className="font-display text-[#ffd700]">{stake.toLocaleString()} GC</span>
              </div>
              <input
                type="range"
                min={100}
                max={Math.min(userCoins, 50_000)}
                step={100}
                value={stake}
                onChange={e => setStake(Number(e.target.value))}
                className="w-full accent-[#e8002d]"
              />
              <div className="flex justify-between text-xs text-[#555] mt-1">
                <span>100 GC</span>
                <span>Potential: <span className="text-[#00d4aa]">{(stake * prediction.multiplierWin).toLocaleString()} GC</span></span>
              </div>
            </div>
          )}

          <button
            onClick={handleBet}
            disabled={!chosen || isSubmitting}
            className="w-full bg-[#e8002d] disabled:bg-[#2a2a2a] disabled:text-[#555] text-white font-display font-bold tracking-widest uppercase py-3 text-sm transition-all"
          >
            {isSubmitting ? 'PLACING...' : 'PLACE BET'}
          </button>
        </>
      )}
    </div>
  );
}
```

---

### `components/leaderboard/LeaderboardTable.tsx`

```typescript
interface User {
  _id: string;
  username: string;
  walletAddress: string;
  totalPoints: number;
  rank: number;
  rankName: string;
}

const POSITION_COLORS: Record<number, string> = {
  1: 'text-[#ffd700]',
  2: 'text-[#c0c0c0]',
  3: 'text-[#cd7f32]',
};

export default function LeaderboardTable({ users }: { users: User[] }) {
  return (
    <div className="border border-[#2a2a2a] overflow-hidden">
      <div className="grid grid-cols-12 px-6 py-3 bg-[#111] text-[#555] text-xs font-display uppercase tracking-widest">
        <span className="col-span-1">POS</span>
        <span className="col-span-4">PILOT</span>
        <span className="col-span-4">RANK</span>
        <span className="col-span-3 text-right">POINTS</span>
      </div>
      {users.map((user, index) => {
        const pos = index + 1;
        const posColor = POSITION_COLORS[pos] || 'text-[#a0a0a0]';
        return (
          <div
            key={user._id}
            className="grid grid-cols-12 px-6 py-4 border-t border-[#1a1a1a] hover:bg-[#111] transition-colors"
          >
            <span className={`col-span-1 font-display font-black text-lg ${posColor}`}>
              P{pos}
            </span>
            <div className="col-span-4">
              <p className="font-bold text-sm">{user.username}</p>
              <p className="text-[#555] text-xs">
                {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
              </p>
            </div>
            <div className="col-span-4">
              <span className="text-[#e8002d] text-xs font-display">{user.rankName}</span>
            </div>
            <span className="col-span-3 text-right font-display font-bold text-[#ffd700]">
              {user.totalPoints.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

---

### `components/race/RaceCard.tsx`

```typescript
const STATUS_STYLES: Record<string, string> = {
  upcoming: 'text-[#a0a0a0] border-[#2a2a2a]',
  qualifying: 'text-[#ffaa00] border-[#ffaa00]',
  active: 'text-[#00d4aa] border-[#00d4aa]',
  completed: 'text-[#555] border-[#555]',
};

interface Race {
  _id: string; name: string; round: number; country: string;
  circuit: string; raceDate: string; status: string;
}

export default function RaceCard({ race, onClick }: { race: Race; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left border border-[#2a2a2a] hover:border-[#e8002d55] p-6 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="font-display text-[#555] text-sm">R{race.round}</span>
        <span className={`font-display text-xs uppercase border px-2 py-1 ${STATUS_STYLES[race.status]}`}>
          {race.status}
        </span>
      </div>
      <h3 className="font-display font-bold text-lg leading-tight group-hover:text-[#e8002d] transition-colors mb-1">
        {race.name}
      </h3>
      <p className="text-[#a0a0a0] text-sm">{race.circuit}</p>
      <p className="text-[#555] text-xs mt-3">
        {new Date(race.raceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </button>
  );
}
```

---

## `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GAMECOIN_ADDRESS: process.env.NEXT_PUBLIC_GAMECOIN_ADDRESS,
    NEXT_PUBLIC_OFFGRID_CORE_ADDRESS: process.env.NEXT_PUBLIC_OFFGRID_CORE_ADDRESS,
    NEXT_PUBLIC_RANK_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_RANK_REGISTRY_ADDRESS,
  },
};

module.exports = nextConfig;
```

---

## `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GAMECOIN_ADDRESS=0x...
NEXT_PUBLIC_OFFGRID_CORE_ADDRESS=0x...
NEXT_PUBLIC_RANK_REGISTRY_ADDRESS=0x...
```

---

## `package.json`

```json
{
  "name": "offgrid-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "ethers": "^6.13.0",
    "lucide-react": "^0.383.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

---

## Key UX Flows

1. **First visit**: Landing → Connect Wallet → Sign message → JWT issued → Dashboard
2. **Build team**: Dashboard → click upcoming race → Team Builder → pick 3 drivers + constructor → Lock In
3. **Predict**: Race page → Predict tab → pick option on each question → slide stake → Place Bet
4. **Buy GameCoins**: Profile → Buy GameCoins → enter ETH amount → MetaMask tx → balance updates
5. **Redeem**: Profile → Redeem → enter coin amount → MetaMask tx → ETH returned to wallet
6. **Leaderboard**: Public, no login needed → shows top 50 by season points