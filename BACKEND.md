# BACKEND.md — OffGrid F1 Fantasy Platform

## Overview

Node.js + Express + TypeScript backend. MongoDB via Mongoose. Wallet-based auth (no passwords — sign message → JWT). Gemini 2.5 Flash for prediction question generation. Ethers.js for on-chain write triggers. Deployed on any Node-compatible host (Railway, Render, etc.).

---

## Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: Wallet signature verification → JWT
- **AI**: Google Gemini 2.5 Flash (`@google/generative-ai`)
- **Blockchain**: Ethers.js v6 (write triggers to Polygon contracts)
- **Env**: dotenv

---

## Environment Variables (`.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=some_long_random_secret
GEMINI_API_KEY=your_gemini_api_key

# Polygon RPC (Amoy testnet or mainnet)
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
ADMIN_PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY

# Deployed contract addresses
GAMECOIN_ADDRESS=0x...
OFFGRID_CORE_ADDRESS=0x...
RANK_REGISTRY_ADDRESS=0x...

ADMIN_WALLET=0xYOUR_ADMIN_WALLET_ADDRESS
```

---

## Directory Structure

```
backend/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── team.ts
│   │   ├── race.ts
│   │   ├── prediction.ts
│   │   ├── leaderboard.ts
│   │   └── admin.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Team.ts
│   │   ├── Race.ts
│   │   ├── Prediction.ts
│   │   └── Bet.ts
│   ├── services/
│   │   ├── scoring.ts
│   │   ├── gemini.ts
│   │   └── blockchain.ts
│   └── middleware/
│       ├── auth.ts
│       └── admin.ts
├── .env
├── package.json
└── tsconfig.json
```

---

## `src/index.ts`

```typescript
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import teamRoutes from './routes/team';
import raceRoutes from './routes/race';
import predictionRoutes from './routes/prediction';
import leaderboardRoutes from './routes/leaderboard';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/race', raceRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

mongoose.connect(process.env.MONGO_URI!).then(() => {
  console.log('MongoDB connected');
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
});
```

---

## Models

### `models/User.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;       // lowercase Ethereum address, unique
  username: string;
  totalPoints: number;         // cumulative seasonal points
  rank: number;                // 1-10
  rankName: string;
  gameCoins: number;           // off-chain balance mirror (source of truth is on-chain for paid, but we mirror for UX)
  tier: 'free' | 'paid';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  walletAddress: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, required: true },
  totalPoints: { type: Number, default: 0 },
  rank: { type: Number, default: 1 },
  rankName: { type: String, default: 'P10 / Points Hunter' },
  gameCoins: { type: Number, default: 0 },
  tier: { type: String, enum: ['free', 'paid'], default: 'free' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
```

---

### `models/Team.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  userId: mongoose.Types.ObjectId;
  raceId: mongoose.Types.ObjectId;
  drivers: string[];           // array of 3 driver IDs (from constants)
  constructor: string;         // constructor ID
  totalCost: number;           // must be <= 60,000,000
  points: number;              // points earned this race
  lockedAt: Date;              // locked before qualifying
  isLocked: boolean;
}

const TeamSchema = new Schema<ITeam>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  raceId: { type: Schema.Types.ObjectId, ref: 'Race', required: true },
  drivers: { type: [String], required: true, validate: (v: string[]) => v.length === 3 },
  constructor: { type: String, required: true },
  totalCost: { type: Number, required: true },
  points: { type: Number, default: 0 },
  lockedAt: { type: Date },
  isLocked: { type: Boolean, default: false },
});

// One team per user per race
TeamSchema.index({ userId: 1, raceId: 1 }, { unique: true });

export default mongoose.model<ITeam>('Team', TeamSchema);
```

---

### `models/Race.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IRace extends Document {
  name: string;                  // e.g. "Monaco Grand Prix 2025"
  round: number;
  season: number;
  circuit: string;
  country: string;
  qualifyingDate: Date;
  raceDate: Date;
  status: 'upcoming' | 'qualifying' | 'active' | 'completed';
  results: {
    driverId: string;
    position: number;
    points: number;              // official F1 championship points
    fastestLap: boolean;
    dnf: boolean;
    overtakes: number;           // manual entry
    qualifyingPosition: number;
  }[];
  constructorResults: {
    constructorId: string;
    points: number;
  }[];
  isSettled: boolean;            // true after admin finalizes results
}

const RaceSchema = new Schema<IRace>({
  name: { type: String, required: true },
  round: { type: Number, required: true },
  season: { type: Number, required: true },
  circuit: String,
  country: String,
  qualifyingDate: Date,
  raceDate: Date,
  status: { type: String, enum: ['upcoming', 'qualifying', 'active', 'completed'], default: 'upcoming' },
  results: [{
    driverId: String,
    position: Number,
    points: Number,
    fastestLap: { type: Boolean, default: false },
    dnf: { type: Boolean, default: false },
    overtakes: { type: Number, default: 0 },
    qualifyingPosition: Number,
  }],
  constructorResults: [{
    constructorId: String,
    points: Number,
  }],
  isSettled: { type: Boolean, default: false },
});

export default mongoose.model<IRace>('Race', RaceSchema);
```

---

### `models/Prediction.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IPrediction extends Document {
  raceId: mongoose.Types.ObjectId;
  question: string;              // Generated by Gemini
  optionA: string;               // Yes-type option
  optionB: string;               // No-type option
  multiplierWin: number;         // 3 or 4 (set by admin or Gemini)
  multiplierLoss: number;        // 1 (always)
  correctOption: 'A' | 'B' | null;
  isSettled: boolean;
  createdAt: Date;
}

const PredictionSchema = new Schema<IPrediction>({
  raceId: { type: Schema.Types.ObjectId, ref: 'Race', required: true },
  question: { type: String, required: true },
  optionA: String,
  optionB: String,
  multiplierWin: { type: Number, default: 3 },
  multiplierLoss: { type: Number, default: 1 },
  correctOption: { type: String, enum: ['A', 'B', null], default: null },
  isSettled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPrediction>('Prediction', PredictionSchema);
```

---

### `models/Bet.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IBet extends Document {
  userId: mongoose.Types.ObjectId;
  predictionId: mongoose.Types.ObjectId;
  raceId: mongoose.Types.ObjectId;
  chosenOption: 'A' | 'B';
  amountStaked: number;          // in GameCoins
  potentialReturn: number;       // amountStaked * multiplierWin
  result: 'win' | 'loss' | 'pending';
  settledAt: Date | null;
}

const BetSchema = new Schema<IBet>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  predictionId: { type: Schema.Types.ObjectId, ref: 'Prediction', required: true },
  raceId: { type: Schema.Types.ObjectId, ref: 'Race', required: true },
  chosenOption: { type: String, enum: ['A', 'B'], required: true },
  amountStaked: { type: Number, required: true },
  potentialReturn: { type: Number, required: true },
  result: { type: String, enum: ['win', 'loss', 'pending'], default: 'pending' },
  settledAt: { type: Date, default: null },
});

// One bet per user per prediction
BetSchema.index({ userId: 1, predictionId: 1 }, { unique: true });

export default mongoose.model<IBet>('Bet', BetSchema);
```

---

## Services

### `services/scoring.ts`

Custom F1 fantasy scoring. Called after admin enters race results.

```typescript
// SCORING RULES (tweak as needed):
// Race finish position → points:
//   P1: 25, P2: 18, P3: 15, P4: 12, P5: 10,
//   P6: 8, P7: 6, P8: 4, P9: 2, P10: 1, P11+: 0
// Qualifying bonus:
//   P1 qualifying: +5, P2: +3, P3: +2, P4-P10: +1
// Fastest lap: +3
// DNF: -5
// Overtakes: +1 per overtake
// Constructor: sum of both drivers' base race points × 1.0 (no multiplier)

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
```

---

### `services/gemini.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generatePredictionQuestions(
  raceName: string,
  circuit: string,
  country: string,
  round: number
): Promise<{ question: string; optionA: string; optionB: string; multiplierWin: number }[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
You are generating prediction questions for an F1 fantasy game called OffGrid.
The upcoming race is: ${raceName} at ${circuit}, ${country} (Round ${round}).

Generate exactly 3 prediction questions that F1 fans would find exciting to bet on.
Each question must be a binary yes/no style question about something that will happen in the race.

Respond ONLY with a valid JSON array, no markdown, no explanation:
[
  {
    "question": "Will there be a Safety Car during the race?",
    "optionA": "Yes, Safety Car deployed",
    "optionB": "No Safety Car",
    "multiplierWin": 3
  },
  ...
]

Rules:
- multiplierWin must be either 3 or 4 (use 4 for less likely outcomes, 3 for more likely)
- Questions must be specific to this race/circuit
- Avoid questions about specific driver wins (too obvious)
- Focus on: safety cars, overtakes, weather, DNFs, fastest lap holders, qualifying surprises
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown fences if present
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return parsed;
}
```

---

### `services/blockchain.ts`

```typescript
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
```

---

## Middleware

### `middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: string; walletAddress: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = { userId: decoded.userId, walletAddress: decoded.walletAddress };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### `middleware/admin.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const adminWallet = process.env.ADMIN_WALLET?.toLowerCase();
  if (req.user?.walletAddress?.toLowerCase() !== adminWallet) {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}
```

---

## Routes

### `routes/auth.ts`

```typescript
import { Router, Request, Response } from 'express';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

// GET /api/auth/nonce/:address
// Returns a nonce message the wallet must sign
router.get('/nonce/:address', async (req: Request, res: Response) => {
  const address = req.params.address.toLowerCase();
  const nonce = `Sign this message to login to OffGrid Fantasy.\nWallet: ${address}\nNonce: ${Date.now()}`;
  res.json({ nonce });
});

// POST /api/auth/verify
// Body: { address, signature, nonce, username? }
// Verifies signature, creates user if new, returns JWT
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { address, signature, nonce, username } = req.body;
    const recoveredAddress = ethers.verifyMessage(nonce, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    let user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user) {
      user = await User.create({
        walletAddress: address.toLowerCase(),
        username: username || `Racer_${address.slice(2, 8)}`,
      });
    }

    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Auth failed' });
  }
});

export default router;
```

---

### `routes/team.ts`

```typescript
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Team from '../models/Team';
import Race from '../models/Race';

const router = Router();
router.use(authMiddleware);

// GET /api/team/:raceId — get user's team for a race
router.get('/:raceId', async (req: AuthRequest, res: Response) => {
  const team = await Team.findOne({ userId: req.user!.userId, raceId: req.params.raceId });
  if (!team) return res.status(404).json({ error: 'No team found' });
  res.json(team);
});

// POST /api/team — create team for a race
// Body: { raceId, drivers: [id1, id2, id3], constructor: id, totalCost }
router.post('/', async (req: AuthRequest, res: Response) => {
  const { raceId, drivers, constructor, totalCost } = req.body;

  if (drivers.length !== 3) return res.status(400).json({ error: '3 drivers required' });
  if (totalCost > 60_000_000) return res.status(400).json({ error: 'Over cost cap' });

  const race = await Race.findById(raceId);
  if (!race) return res.status(404).json({ error: 'Race not found' });
  if (race.status !== 'upcoming') return res.status(400).json({ error: 'Race already started' });

  const existing = await Team.findOne({ userId: req.user!.userId, raceId });
  if (existing) return res.status(400).json({ error: 'Team already exists for this race' });

  const team = await Team.create({
    userId: req.user!.userId,
    raceId,
    drivers,
    constructor,
    totalCost,
  });
  res.json(team);
});

// PUT /api/team/:raceId — update team (only if race is upcoming AND a driver is not racing)
router.put('/:raceId', async (req: AuthRequest, res: Response) => {
  const { drivers, constructor, totalCost, swappedDriverId } = req.body;

  const race = await Race.findById(req.params.raceId);
  if (!race) return res.status(404).json({ error: 'Race not found' });

  // Swap only allowed if a driver is not racing (manual flag in race results or admin marks)
  if (race.status !== 'upcoming' && !swappedDriverId) {
    return res.status(400).json({ error: 'Team is locked. Swap only allowed for non-racing drivers.' });
  }

  if (totalCost > 60_000_000) return res.status(400).json({ error: 'Over cost cap' });

  const team = await Team.findOneAndUpdate(
    { userId: req.user!.userId, raceId: req.params.raceId },
    { drivers, constructor, totalCost },
    { new: true }
  );
  res.json(team);
});

export default router;
```

---

### `routes/race.ts`

```typescript
import { Router, Request, Response } from 'express';
import Race from '../models/Race';

const router = Router();

// GET /api/race — all races for current season
router.get('/', async (req: Request, res: Response) => {
  const season = new Date().getFullYear();
  const races = await Race.find({ season }).sort({ round: 1 });
  res.json(races);
});

// GET /api/race/:id — single race
router.get('/:id', async (req: Request, res: Response) => {
  const race = await Race.findById(req.params.id);
  if (!race) return res.status(404).json({ error: 'Race not found' });
  res.json(race);
});

export default router;
```

---

### `routes/prediction.ts`

```typescript
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import Prediction from '../models/Prediction';
import Bet from '../models/Bet';
import User from '../models/User';
import Race from '../models/Race';
import { generatePredictionQuestions } from '../services/gemini';

const router = Router();

// GET /api/prediction/:raceId — get predictions for a race
router.get('/:raceId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const predictions = await Prediction.find({ raceId: req.params.raceId });
  res.json(predictions);
});

// POST /api/prediction/generate/:raceId — admin generates questions using Gemini
router.post('/generate/:raceId', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const race = await Race.findById(req.params.raceId);
  if (!race) return res.status(404).json({ error: 'Race not found' });

  const questions = await generatePredictionQuestions(race.name, race.circuit, race.country, race.round);

  const predictions = await Prediction.insertMany(
    questions.map(q => ({
      raceId: race._id,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      multiplierWin: q.multiplierWin,
    }))
  );
  res.json(predictions);
});

// POST /api/prediction/bet — user places a bet
// Body: { predictionId, raceId, chosenOption: 'A'|'B', amountStaked }
router.post('/bet', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { predictionId, raceId, chosenOption, amountStaked } = req.body;

  const user = await User.findById(req.user!.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.gameCoins < amountStaked) return res.status(400).json({ error: 'Insufficient GameCoins' });

  const prediction = await Prediction.findById(predictionId);
  if (!prediction || prediction.isSettled) return res.status(400).json({ error: 'Prediction not available' });

  const existing = await Bet.findOne({ userId: req.user!.userId, predictionId });
  if (existing) return res.status(400).json({ error: 'Already bet on this prediction' });

  // Deduct coins
  user.gameCoins -= amountStaked;
  await user.save();

  const bet = await Bet.create({
    userId: req.user!.userId,
    predictionId,
    raceId,
    chosenOption,
    amountStaked,
    potentialReturn: amountStaked * prediction.multiplierWin,
  });

  res.json(bet);
});

// POST /api/prediction/settle/:predictionId — admin settles prediction
// Body: { correctOption: 'A' | 'B' }
router.post('/settle/:predictionId', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { correctOption } = req.body;
  const prediction = await Prediction.findByIdAndUpdate(
    req.params.predictionId,
    { correctOption, isSettled: true },
    { new: true }
  );

  if (!prediction) return res.status(404).json({ error: 'Prediction not found' });

  // Settle all bets for this prediction
  const bets = await Bet.find({ predictionId: prediction._id, result: 'pending' });

  for (const bet of bets) {
    const won = bet.chosenOption === correctOption;
    bet.result = won ? 'win' : 'loss';
    bet.settledAt = new Date();
    await bet.save();

    if (won) {
      await User.findByIdAndUpdate(bet.userId, {
        $inc: { gameCoins: bet.potentialReturn },
      });
    }
    // loss: coins already deducted at bet time
  }

  res.json({ settled: bets.length, prediction });
});

export default router;
```

---

### `routes/leaderboard.ts`

```typescript
import { Router, Request, Response } from 'express';
import User from '../models/User';

const router = Router();

// GET /api/leaderboard?limit=50
router.get('/', async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const users = await User.find({})
    .sort({ totalPoints: -1 })
    .limit(limit)
    .select('username walletAddress totalPoints rank rankName');
  res.json(users);
});

export default router;
```

---

### `routes/admin.ts`

Full admin routes — race management + result entry + scoring trigger.

```typescript
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import Race from '../models/Race';
import Team from '../models/Team';
import User from '../models/User';
import { calculateTeamPoints, getRankFromPoints } from '../services/scoring';
import { updateRankOnChain } from '../services/blockchain';

const router = Router();
router.use(authMiddleware, adminMiddleware);

// POST /api/admin/race — create a race
router.post('/race', async (req: AuthRequest, res: Response) => {
  const race = await Race.create(req.body);
  res.json(race);
});

// PUT /api/admin/race/:id/status — update race status
// Body: { status: 'qualifying' | 'active' | 'completed' }
router.put('/race/:id/status', async (req: AuthRequest, res: Response) => {
  const race = await Race.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });

  // Lock all teams when qualifying starts
  if (req.body.status === 'qualifying') {
    await Team.updateMany({ raceId: req.params.id }, { isLocked: true, lockedAt: new Date() });
  }
  res.json(race);
});

// POST /api/admin/race/:id/results — enter race results manually
// Body: { results: [...], constructorResults: [...] }
router.post('/race/:id/results', async (req: AuthRequest, res: Response) => {
  const { results, constructorResults } = req.body;
  const race = await Race.findByIdAndUpdate(
    req.params.id,
    { results, constructorResults, status: 'completed', isSettled: true },
    { new: true }
  );
  if (!race) return res.status(404).json({ error: 'Race not found' });

  // Calculate points for all teams in this race
  const teams = await Team.find({ raceId: race._id });

  for (const team of teams) {
    const points = calculateTeamPoints(team.drivers, team.constructor, results);
    team.points = points;
    await team.save();

    // Update user total points and rank
    const user = await User.findById(team.userId);
    if (user) {
      user.totalPoints += points;
      const { rank, rankName } = getRankFromPoints(user.totalPoints);
      user.rank = rank;
      user.rankName = rankName;
      await user.save();

      // Write rank on-chain (non-blocking, best-effort)
      updateRankOnChain(user.walletAddress, rank, rankName).catch(console.error);
    }
  }

  res.json({ message: 'Results settled', teamsUpdated: teams.length });
});

export default router;
```

---

## Constants

### Driver & Constructor Data

Create `src/constants/drivers.ts`:

```typescript
export const DRIVERS = [
  { id: 'VER', name: 'Max Verstappen', team: 'red_bull', price: 14_000_000, number: 1 },
  { id: 'PER', name: 'Sergio Perez', team: 'red_bull', price: 9_000_000, number: 11 },
  { id: 'LEC', name: 'Charles Leclerc', team: 'ferrari', price: 12_000_000, number: 16 },
  { id: 'SAI', name: 'Carlos Sainz', team: 'ferrari', price: 11_000_000, number: 55 },
  { id: 'NOR', name: 'Lando Norris', team: 'mclaren', price: 11_000_000, number: 4 },
  { id: 'PIA', name: 'Oscar Piastri', team: 'mclaren', price: 9_500_000, number: 81 },
  { id: 'HAM', name: 'Lewis Hamilton', team: 'mercedes', price: 12_000_000, number: 44 },
  { id: 'RUS', name: 'George Russell', team: 'mercedes', price: 10_000_000, number: 63 },
  { id: 'ALO', name: 'Fernando Alonso', team: 'aston_martin', price: 9_000_000, number: 14 },
  { id: 'STR', name: 'Lance Stroll', team: 'aston_martin', price: 6_000_000, number: 18 },
  { id: 'GAS', name: 'Pierre Gasly', team: 'alpine', price: 7_000_000, number: 10 },
  { id: 'OCO', name: 'Esteban Ocon', team: 'alpine', price: 6_500_000, number: 31 },
  { id: 'TSU', name: 'Yuki Tsunoda', team: 'rb', price: 6_000_000, number: 22 },
  { id: 'RIC', name: 'Daniel Ricciardo', team: 'rb', price: 6_000_000, number: 3 },
  { id: 'BOT', name: 'Valtteri Bottas', team: 'kick_sauber', price: 5_500_000, number: 77 },
  { id: 'ZHO', name: 'Guanyu Zhou', team: 'kick_sauber', price: 5_000_000, number: 24 },
  { id: 'MAG', name: 'Kevin Magnussen', team: 'haas', price: 5_500_000, number: 20 },
  { id: 'HUL', name: 'Nico Hulkenberg', team: 'haas', price: 5_500_000, number: 27 },
  { id: 'ALB', name: 'Alexander Albon', team: 'williams', price: 6_500_000, number: 23 },
  { id: 'SAR', name: 'Logan Sargeant', team: 'williams', price: 4_500_000, number: 2 },
];

export const CONSTRUCTORS = [
  { id: 'red_bull', name: 'Red Bull Racing', price: 15_000_000 },
  { id: 'ferrari', name: 'Ferrari', price: 13_000_000 },
  { id: 'mercedes', name: 'Mercedes', price: 12_000_000 },
  { id: 'mclaren', name: 'McLaren', price: 11_000_000 },
  { id: 'aston_martin', name: 'Aston Martin', price: 8_000_000 },
  { id: 'alpine', name: 'Alpine', price: 6_000_000 },
  { id: 'rb', name: 'RB (AlphaTauri)', price: 5_500_000 },
  { id: 'kick_sauber', name: 'Kick Sauber', price: 4_500_000 },
  { id: 'haas', name: 'Haas', price: 4_500_000 },
  { id: 'williams', name: 'Williams', price: 4_000_000 },
];
```

---

## `package.json`

```json
{
  "name": "offgrid-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "ethers": "^6.13.0",
    "express": "^4.18.0",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/node": "^20.0.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Key Flows Summary

1. **Auth**: Frontend gets nonce → user signs with MetaMask → backend verifies with `ethers.verifyMessage` → JWT issued
2. **Team Build**: User picks 3 drivers + 1 constructor under 60M → POST `/api/team` → locked when admin sets race status to `qualifying`
3. **Prediction**: Admin triggers Gemini generation → questions stored → users bet GameCoins → admin settles after race → winners get coins back × multiplier
4. **Scoring**: Admin POSTs results to `/api/admin/race/:id/results` → scoring service calculates → user totalPoints updated → rank recalculated → on-chain rank write triggered
5. **Reward**: User's GameCoin balance tracked in MongoDB (off-chain mirror) → redemption triggers `distributeReward` on OffGridCore contract → ETH equivalent sent on-chain