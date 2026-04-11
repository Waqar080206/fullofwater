# LapLogic Frontend User Flow

This document outlines the user journey and interactions across the LapLogic frontend based on the current application structure.

```mermaid
graph TD
    %% Entry Point
    A[Landing Page / Home] --> B{Wallet Connected?}
    
    %% Authentication Flow
    B -- No --> C[Click 'Connect Wallet' in Navbar]
    C --> D[MetaMask Signature & Verification]
    D --> E[Authenticated User]
    B -- Yes --> E

    %% Main Navigation
    E --> F[Dashboard]
    
    %% Dashboard Features
    F -->|Manage Funds| G[GameCoin Widget]
    G -->|Spend ETH| H[(Smart Contract: Mint GameCoins)]
    H --> F
    
    F -->|Strategy| I[LapLogic AI Chatbot]
    I -->|Ask Questions| J[AI Response]
    
    %% Team Management
    F --> K{Has Active Team?}
    K -- No --> L[Click 'Enter Arena']
    L --> M[Team Builder Page /team]
    M --> N[Select F1 Drivers]
    M --> O[Select F1 Constructor]
    N & O --> P{Within Cost Cap?}
    P -- Yes --> Q[Save Team]
    P -- No --> M
    
    %% Predictions & Racing
    K -- Yes --> R[View Active Team Profile]
    R --> S[Go to Next Race Page /race/:id]
    Q --> S
    
    S --> T[Predict Outcomes /predict/:id]
    T --> U[Stake GameCoins via Smart Contract]
    U --> V[Prediction Submitted]
    
    %% Global
    V --> W[Arena / Global Leaderboard]
    F --> W
    
    %% Post-Race
    W -->|Admin Settles Race| X[(RankRegistry Smart Contract)]
    X -->|Update Player Rank| F
```

## Key Modules Explained

1. **Authentication (`/context/WalletContext.tsx`, `AuthButton.tsx`)**: Replaces traditional email/password with Web3 wallet signatures (MetaMask).
2. **Dashboard (`/dashboard`)**: The central hub displaying the user's Driver Profile, Active Team, GameCoin Balance, Next Race details, and the LapLogic AI Chatbot.
3. **GameCoin Purchasing (`GameCoinWidget.tsx`, `lib/ethers.ts`)**: Integrates directly with the deployed `GameCoin.sol` contract locally, converting mock test ETH to in-game currency (GC).
4. **Team Builder (`/team`)**: Users build their optimal F1 fantasy lineup ensuring they stay under the specified cost cap.
5. **Predictions (`/predict/[raceId]`)**: Users put their GameCoins on the line based on their team setup and race expectations.
