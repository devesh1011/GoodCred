# GoodCred - Decentralized Credit Scoring Platform

> Empowering financial inclusion through decentralized credit scoring on the Celo blockchain.

GoodCred is a DeFi platform that enables users to build on-chain credit scores through verified tasks (quests) and access loans based on their reputation. Built on Celo blockchain with GoodDollar (G$) token integration, it combines GoodID verification, Reclaim Protocol for off-chain data attestation, and smart contract-based lending pools.

## 📋 Table of Contents

- [Challenge Track](#-challenge-track-community-finance-systems--coordination)
- [Architecture Overview](#architecture-overview)
- [Smart Contracts](#smart-contracts)
- [Contract Addresses](#contract-addresses)
- [Technical Stack](#technical-stack)
- [System Architecture](#system-architecture)
- [Setup & Installation](#setup--installation)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Security Considerations](#security-considerations)

## 💸 Track: Community Finance Systems & Coordination

GoodCred directly addresses the **business credit distribution** and **community treasury management** coordination challenge by building a transparent, trustless credit scoring and lending system using GoodDollar (G$) on Celo. It replaces traditional credit bureaus with on-chain reputation tracking that integrates GoodID verification for Sybil resistance, smart contract-based lending pools for automated treasury management, and Reclaim Protocol for verifiable web2 data attestation.

Users build credit scores (0-850) through verified on-chain quests (DEX swaps, staking, governance) and off-chain achievements (courses, certifications) verified via Reclaim Protocol. The system provides collateral-free loans where max loan = credit score × 100 G$, with 5% interest paid to community depositors. GoodID verification ensures unique person validation, preventing fraud while enabling financial inclusion. Every score update and loan transaction is cryptographically secured and transparently recorded on-chain, creating an immutable credit history that travels with the user across platforms.

## 🏗️ Architecture Overview

GoodCred is built as a modular system with three core smart contracts and a Next.js frontend that interact to provide a complete credit scoring and lending platform:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                   │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  Dashboard │  │    Quests    │  │   Lending Portal    │  │
│  └────────────┘  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                  ┌─────────┴─────────┐
                  │   Web3 Layer      │
                  │  (wagmi/viem)     │
                  └─────────┬─────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Smart Contracts (Celo)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │QuestRegistry │──│GoodCredScore │──│  LendingPool    │    │
│  │              │  │              │  │                 │    │
│  │ - Quest defs │  │ - User scores│  │ - G$ deposits   │    │
│  │ - Parameters │  │ - Verif data │  │ - Loan mgmt     │    │
│  └──────────────┘  └──────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                  ┌─────────┴─────────┐
                  │   GoodDollar (G$) │
                  │   ERC677 Token    │
                  └───────────────────┘
```

### Contract Interaction Flow

1. **User Registration**
   - User creates profile in `GoodCredScore` contract
   - Initial score set to 0 (range: 0-850)

2. **GoodID Verification**
   - User verifies identity through GoodID
   - Admin confirms verification on-chain
   - User receives 100 bonus points

3. **Quest Completion**
   - **On-Chain Quests**: Verified automatically via blockchain data
   - **Off-Chain Quests**: Verified via Reclaim Protocol proofs
   - Score updated based on quest points

4. **Lending Operations**
   - User requests loan based on credit score
   - Max loan = (Credit Score × 100) G$ tokens
   - Interest rate: 5% (500 basis points)
   - Loan term: 30 days
   - Repayment increases credit score

## 📝 Smart Contracts

### 1. QuestRegistry.sol

**Purpose**: Central registry for all quest definitions and parameters.

**Key Functions**:
```solidity
function addQuest(
    bytes32 questId,
    string memory description,
    uint256 scorePoints,
    QuestType questType,
    address targetContract,
    string memory reclaimProvider,
    string memory reclaimClaimData
) external onlyOwner

function getQuest(bytes32 questId) external view returns (Quest memory)
```

**Quest Types**:
- `ON_CHAIN`: Verified through blockchain interactions (e.g., token swap, staking)
- `OFF_CHAIN`: Verified through Reclaim Protocol (e.g., course completion, social proof)

**State Variables**:
- `mapping(bytes32 => Quest) quests`: Quest definitions
- `bytes32[] questIds`: Array of all quest IDs

### 2. GoodCredScore.sol

**Purpose**: Core credit scoring engine that manages user profiles and score calculations.

**Key Functions**:
```solidity
function register() external
function confirmGoodIdVerification(address user) external onlyOwner
function completeOnChainQuest(bytes32 questId) external
function completeOffChainQuest(bytes32 questId, bytes memory proof) external
function getUserScore(address user) external view returns (uint256)
```

**Scoring System**:
- Score Range: 0-850 (mirrors traditional FICO scores)
- GoodID Verification: +100 points
- Quest Completion: Variable points (defined per quest)
- Loan Repayment: +50 points
- Score never decreases (only increases)

**State Variables**:
- `mapping(address => UserProfile) profiles`: User credit profiles
- `mapping(address => bool) goodIdVerified`: GoodID verification status
- `QuestRegistry questRegistry`: Reference to quest registry

**User Profile Structure**:
```solidity
struct UserProfile {
    address userAddress;
    bool isVerified;          // GoodID verified
    uint256 score;            // 0-850 range
    uint256 registrationTime;
    mapping(bytes32 => bool) completedQuests;
}
```

### 3. LendingPool.sol

**Purpose**: Manages G$ token deposits, loan origination, and repayments.

**Key Functions**:
```solidity
function deposit(uint256 amount) external
function withdraw(uint256 amount) external
function takeLoan(uint256 loanAmount) external
function repayLoan() external
function onTokenTransfer(address from, uint256 amount, bytes calldata data) external
```

**Loan Parameters**:
- Minimum Credit Score: 300 (to qualify for any loan)
- Loan Amount Calculation: `maxLoan = creditScore × 100 G$`
- Interest Rate: 5% (500 basis points)
- Loan Duration: 30 days
- Collateral: None (unsecured, credit-based lending)

**Example Loan Amounts**:
| Credit Score | Max Loan Amount |
|--------------|-----------------|
| 300          | 30,000 G$       |
| 500          | 50,000 G$       |
| 700          | 70,000 G$       |
| 850          | 85,000 G$       |

**State Variables**:
- `IERC20 gDollarToken`: G$ token contract reference
- `GoodCredScore scoreContract`: Credit score contract reference
- `mapping(uint256 => Loan) loans`: Loan records
- `mapping(address => uint256) activeLoanId`: Active loan per user

**Loan Structure**:
```solidity
struct Loan {
    uint256 loanId;
    address borrower;
    uint256 principal;
    uint256 amountDue;      // principal + interest
    uint256 dueDate;
    bool isRepaid;
    uint256 borrowTime;
}
```

### 4. GoodDollarConfig.sol

**Purpose**: Configuration library for G$ token addresses across networks.

**Supported Networks**:
- Celo Mainnet (Chain ID: 42220)
- Celo Alfajores Testnet (Chain ID: 44787)
- Fuse Mainnet
- Fuse Testnet

## 📍 Contract Addresses

### Celo Mainnet (Chain ID: 42220)

| Contract | Address | Purpose |
|----------|---------|---------|
| **GoodDollar (G$) Token** | `0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A` | ERC677 token for lending |
| **QuestRegistry** | `0x39e86627B3438D141ba581581Ae79416495EaC80` | Quest definitions |
| **GoodCredScore** | `0x111EA01f8Ffc0d9d2bA88578a45d762672Db255a` | Credit scoring engine |
| **LendingPool** | `0xd37F6A255eeb45dA0d6cD7743b3965e43CF93F50` | Loan management |

### Network Configuration

**Celo Mainnet**:
- RPC URL: `https://forno.celo.org`
- Block Explorer: `https://celoscan.io`
- Chain ID: `42220`
- Native Currency: CELO

**Multicall3**: `0xcA11bde05977b3631167028862bE2a173976CA11` (Block: 13112599)

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js 15.5.5 (App Router, React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Web3 Integration
- **Wallet Connection**: RainbowKit 2.2.1
- **Blockchain Interaction**: wagmi 2.x + viem 2.x
- **State Management**: TanStack Query (React Query)
- **Supported Chains**: Celo, Ethereum, Polygon, Optimism, Arbitrum, Base

### Smart Contracts
- **Language**: Solidity ^0.8.24
- **Framework**: Hardhat 2.22.19
- **Libraries**: OpenZeppelin Contracts 5.1.0
- **Testing**: Hardhat Toolbox
- **Deployment**: Hardhat Ignition

### Backend/Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Wallet-based (SIWE - Sign-In with Ethereum)
- **Off-Chain Data**: Supabase for caching scores, quest metadata

## 🏛️ System Architecture

### Data Flow

1. **User Onboarding**
```
User Wallet → RainbowKit → GoodCredScore.register()
                              ↓
                     Initial Score = 0
                              ↓
                     Profile Created On-Chain
```

2. **Quest Completion (On-Chain)**
```
User Action → Blockchain Interaction → GoodCredScore.completeOnChainQuest()
                                            ↓
                                  Quest Verified via targetContract
                                            ↓
                                  Score += questPoints
                                            ↓
                                  Event Emitted → Frontend Updated
```

3. **Quest Completion (Off-Chain)**
```
User Action → External Platform → Reclaim Protocol Proof
                                            ↓
                        Frontend → GoodCredScore.completeOffChainQuest(proof)
                                            ↓
                                  Verify Reclaim Proof
                                            ↓
                                  Score += questPoints
```

4. **Loan Process**
```
User → Check Score → Calculate Max Loan → takeLoan(amount)
                                              ↓
                              Check: score >= 300 && amount <= maxLoan
                                              ↓
                              Transfer G$ from Pool → User
                                              ↓
                              Create Loan Record (30 days)
                                              ↓
                              Event Emitted
```

5. **Loan Repayment**
```
User → Approve G$ → repayLoan() or onTokenTransfer()
                              ↓
              Transfer G$ (principal + interest) → Pool
                              ↓
              Mark Loan as Repaid
                              ↓
              Score += 50 points (repayment quest)
```

### Security Architecture

- **Reentrancy Protection**: All state-changing functions use `nonReentrant` modifier
- **Access Control**: Owner-only functions for quest management and verification
- **Input Validation**: Comprehensive checks on all user inputs
- **Score Immutability**: Scores can only increase, never decrease
- **Loan Limits**: Enforced based on credit score
- **ERC677 Support**: Safe token transfers with `onTokenTransfer` callback

## 📦 Setup & Installation

### Prerequisites
- Node.js 18+ / Bun
- pnpm / npm
- MetaMask or compatible wallet
- Celo Mainnet CELO tokens (for gas)

### Clone Repository
```bash
git clone https://github.com/devesh1011/GoodCred.git
cd GoodCred
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env.local file
cp .env.example .env.local

# Add your environment variables:
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Smart Contracts Setup
```bash
cd contracts
npm install

# Create .env file
cp .env.example .env

# Add your private key and API keys:
# PRIVATE_KEY=your_wallet_private_key
# CELOSCAN_API_KEY=your_celoscan_api_key

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Celo Mainnet
npm run deploy:celo
```

## 📁 Project Structure

```
realfi-hack/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── dashboard/      # User dashboard
│   │   │   ├── quests/         # Quest browsing & completion
│   │   │   └── lending/        # Borrowing & lending portal
│   │   ├── components/         # React components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── providers.tsx  # Web3 providers
│   │   │   └── ...
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useGoodCred.ts # Credit score hook
│   │   │   ├── useQuests.ts   # Quest management
│   │   │   └── useLending.ts  # Lending operations
│   │   └── lib/               # Utilities & configs
│   ├── public/                # Static assets
│   └── package.json
│
├── contracts/                  # Smart contracts
│   ├── contracts/
│   │   ├── GoodCredScore.sol   # Credit scoring engine
│   │   ├── LendingPool.sol     # Lending protocol
│   │   ├── QuestRegistry.sol   # Quest management
│   │   └── GoodDollarConfig.sol # Network configs
│   ├── interfaces/
│   │   └── IERC677.sol        # ERC677 interface
│   ├── test/                  # Contract tests
│   ├── ignition/              # Deployment scripts
│   └── hardhat.config.ts      # Hardhat configuration
│
└── README.md                  # This file
```

## ✨ Key Features

### 1. Credit Score System
- **Range**: 0-850 (similar to FICO)
- **Transparent**: All score changes recorded on-chain
- **Immutable**: Scores can only increase
- **Real-time**: Instant updates on quest completion

### 2. Quest Types

**On-Chain Quests** (verified automatically):
- Token swaps on DEXs
- Staking participation
- Governance voting
- Protocol interactions

**Off-Chain Quests** (verified via Reclaim Protocol):
- Course completion (Coursera, Udemy)
- Social media engagement
- Professional certifications
- Identity verifications

### 3. Lending Protocol
- **Unsecured Lending**: No collateral required
- **Credit-Based**: Loan limits based on score
- **Competitive Rates**: 5% fixed interest
- **Flexible Amounts**: Borrow from 30,000 to 85,000 G$
- **Score Boost**: Earn points on successful repayment

### 4. GoodDollar Integration
- **ERC677 Token**: Advanced token standard with transfer hooks
- **Low Fees**: Celo blockchain's low transaction costs
- **Instant Settlement**: Real-time loan disbursement
- **UBI Aligned**: Supports GoodDollar's mission

### 5. User Experience
- **One-Click Connect**: RainbowKit wallet integration
- **Dashboard**: Real-time score visualization
- **Quest Browser**: Filter and discover quests
- **Loan Calculator**: Calculate interest before borrowing
- **Activity Feed**: Track all credit-building activities

## 🔒 Security Considerations

### Smart Contract Security
- **Audited Imports**: Uses OpenZeppelin's audited contracts
- **Reentrancy Guards**: Protection on all external calls
- **Access Controls**: Role-based permissions
- **Input Validation**: Comprehensive parameter checks
- **Event Logging**: Complete audit trail
