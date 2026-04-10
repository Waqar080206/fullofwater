# OffGrid — F1 Fantasy on Chain

Pick 3 drivers + 1 constructor. Predict race outcomes. Earn GameCoins. Redeem to ETH.

---

## Stack

- **Frontend** — Next.js 14, Tailwind, Ethers.js
- **Backend** — Node.js, Express, MongoDB, Gemini 2.5 Flash
- **Contracts** — Solidity 0.8.20, Hardhat, Polygon Amoy

---

## Structure

```
offgrid/
├── frontend/
├── backend/
├── contracts/
├── FRONTEND.md    ← full frontend spec
├── BACKEND.md     ← full backend spec
├── CONTRACTS.md   ← full contracts spec
└── README.md
```

---

## How to Build This

Each spec file is a self-contained prompt for an AI coding assistant (Gemini, Copilot, etc.).
Feed them in this order:

### Step 1 — Contracts
Feed `CONTRACTS.md` first.
> "Build the complete Solidity contracts and Hardhat setup following this spec."

Copy deployed addresses to `backend/.env` and `frontend/.env.local`.

### Step 2 — Backend
Feed `BACKEND.md` second.
> "Build the complete Node.js + Express + MongoDB backend following this spec."

### Step 3 — Frontend
Feed `FRONTEND.md` last.
> "Build the complete Next.js frontend following this spec."

---

## Running Locally

```bash
# Contracts
cd contracts && npm install
npx hardhat run scripts/deploy.ts --network amoy

# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

---

## Env Files

| File | Defined in |
|------|-----------|
| `backend/.env` | BACKEND.md → Environment Variables |
| `frontend/.env.local` | FRONTEND.md → Environment Variables |
| `contracts/.env` | CONTRACTS.md → Environment Variables |