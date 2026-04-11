# LapLogic
### F1 racing strategy game on the blockchain

LapLogic is a Web3-powered racing strategy game built around the 2026 Formula 1 season. You act as a team principal, build your roster under a cost cap, invest your remaining budget into race pools and earn real on-chain rewards based purely on how good your strategy is. Connect your wallet, get GameCoin instantly and play. No crypto knowledge required to get started.

---

## what it does

- build a team of 3 drivers and 1 constructor within a 60 million GameCoin cost cap
- invest your remaining budget into the race pool before each race weekend
- get AI-generated prediction challenges based on real race conditions every week
- earn GameCoin automatically via smart contract based on your leaderboard performance
- your rank and earnings are written on-chain permanently. Fully yours and fully verifiable.

---

## tech stack

**frontend**
- Next.js 14, React 18, Tailwind CSS
- Ethers.js v6, Firebase, Groq SDK, Lucide React

**backend**
- Node.js v20+, Express, MongoDB with Mongoose
- Google Gemini API, Ethers.js v6, JSON Web Token

**smart contracts**
- Solidity ^0.8.20, Hardhat, OpenZeppelin Contracts v5
- Deployed on Polygon Amoy Testnet (chainId: 80002)

---

## project structure

```
laplogic/
├── frontend/        # Next.js app
├── backend/         # Express API server
└── contracts/       # Hardhat + Solidity
```

---

## getting started locally

You will need three terminals running at the same time.

### prerequisites
- Node.js v20+
- MetaMask wallet with test MATIC
- MongoDB Atlas cluster
- Gemini API key
- Polygonscan API key

---

### 1. contracts

```bash
cd contracts
npm install
```

Start a local Hardhat node:
```bash
npx hardhat node
```

Open a new terminal and deploy the contracts:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the contract addresses printed in the terminal output. You will need them in the next steps.

Create a `.env` file inside `/contracts`:
```
POLYGON_AMOY_RPC=
PRIVATE_KEY=
POLYGONSCAN_API_KEY=
BACKEND_WALLET_ADDRESS=
```

---

### 2. backend

```bash
cd backend
npm install
```

Create a `.env` file inside `/backend`:
```
PORT=5000
MONGO_URI=
JWT_SECRET=
GEMINI_API_KEY=
POLYGON_RPC_URL=
ADMIN_PRIVATE_KEY=
```

Start the server:
```bash
npm run dev
```

Server runs on `http://localhost:5000`

Optionally seed the database:
```bash
npx ts-node seedRace.ts
npx ts-node scripts/seedPredictions.ts
```

---

### 3. frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file inside `/frontend` using the contract addresses from step 1:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GAMECOIN_ADDRESS=
NEXT_PUBLIC_LAPLOGIC_CORE_ADDRESS=
NEXT_PUBLIC_RANK_REGISTRY_ADDRESS=
```

Start the app:
```bash
npm run dev
```

App runs on `http://localhost:3000`

---

## smart contracts

| contract | purpose |
|---|---|
| `GameCoin.sol` | ERC-20 in-game currency, cost cap enforcement and ETH redemption |
| `LapLogicCore.sol` | game state, prediction validation and automatic reward distribution |
| `RankRegistry.sol` | on-chain leaderboard and permanent user rank history |

### deployment scripts

```bash
npm run compile          # compile all contracts
npm run test             # run test suites
npm run deploy:amoy      # deploy to Polygon Amoy testnet
npm run deploy:polygon   # deploy to Polygon mainnet
npm run verify:amoy      # verify contracts on Polygonscan
```

---

## available scripts

| directory | command | description |
|---|---|---|
| frontend | `npm run dev` | start dev server |
| frontend | `npm run build` | production build |
| backend | `npm run dev` | start with hot reload |
| backend | `npm run build` | compile TypeScript |
| contracts | `npm run compile` | compile Solidity |
| contracts | `npm run test` | run contract tests |

---
