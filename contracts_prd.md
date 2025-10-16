Of course. Here is a detailed technical document for the "GoodCred: Build Your RealFi Score" project, designed to serve as a comprehensive blueprint for development.

***

### **Technical Specification: GoodCred Protocol v1.0**

**Document Version:** 1.0
**Date:** October 15, 2025
**Project:** GoodCred: Build Your RealFi Score

### 1.0 Introduction

#### 1.1 Project Vision
GoodCred is a decentralized protocol designed to create a portable, user-owned credit history for individuals, particularly those underserved by traditional financial systems. By leveraging a user's on-chain activities and privacy-preserving off-chain data, GoodCred generates a "RealFi Score" that unlocks access to undercollateralized loans within the Celo and GoodDollar ecosystems.

#### 1.2 Problem Statement
Traditional credit scoring is inaccessible to billions of people who lack formal banking histories. This "cold start" problem traps them in a cycle of financial exclusion. The web3 space, while promising, often lacks a mechanism to distinguish between reputable actors and anonymous wallets, making trust and undercollateralized lending difficult.

#### 1.3 Solution Overview
GoodCred addresses this by:
1.  **Establishing a Sybil-resistant identity** using GoodDollar's GoodID as a baseline.
2.  **Quantifying trustworthy behavior** through a system of on-chain and off-chain "Quests."
3.  **Providing tangible utility** for a high score by granting access to a G$-denominated micro-lending pool.

---

### 2.0 System Architecture

The GoodCred protocol is composed of three primary layers: the on-chain smart contracts, the frontend dApp, and integrations with external protocols.



1.  **On-Chain Layer (Celo Blockchain):**
    * **`GoodCredScore.sol`:** The core contract that manages user profiles, calculates scores, and verifies Quest completion.
    * **`LendingPool.sol`:** The contract managing the pool of loanable G$ tokens, handling deposits, borrowing, and repayments.
    * **`QuestRegistry.sol`:** An administrative contract that holds the definitions and parameters for all available Quests.

2.  **Frontend Layer (Web Application):**
    * A React-based single-page application that serves as the user interface for the protocol. It interacts directly with user wallets (e.g., MetaMask, Valora, GoodWallet) to sign transactions and with the on-chain contracts.

3.  **External Protocol Integrations:**
    * **GoodID SDK:** Used for initial user verification to establish a unique, Sybil-resistant identity.
    * **Reclaim Protocol SDK:** Used to generate and verify zero-knowledge proofs (ZKPs) of users' off-chain data without compromising their privacy.
    * **The Graph Protocol:** A subgraph will be created to index events and state from our smart contracts, enabling efficient data querying for the frontend and removing the need for direct, slow RPC calls.

---

### 3.0 Core Components (Detailed Breakdown)

#### 3.1 Smart Contracts

##### 3.1.1 `GoodCredScore.sol`
This is the central logic contract for user identity and scoring.
* **State Variables:**
    * `mapping(address => UserProfile) private profiles;`: Maps a user's wallet address to their profile data.
    * `address public questRegistry;`: The address of the `QuestRegistry` contract.
* **Core Functions:**
    * `function register()`:
        * **Action:** A new user calls this to create their profile.
        * **Pre-conditions:** The `msg.sender` must not already have a profile.
        * **Logic:** This function's primary role is to trigger an interaction with the GoodID system (handled by the frontend SDK). For the purpose of the smart contract, it will initialize a `UserProfile` struct for the user. A subsequent call will be needed to confirm GoodID verification.
    * `function confirmGoodIdVerification(bytes memory goodIdProof)`:
        * **Action:** Called after the user successfully completes the GoodID verification flow on the frontend.
        * **Logic:** Verifies the `goodIdProof` (details TBD based on SDK). On success, it sets `profile.isVerified` to `true` and awards the baseline credit score points.
    * `function completeOnChainQuest(bytes32 questId)`:
        * **Action:** User calls this to get credit for an on-chain action.
        * **Logic:**
            1.  Retrieves the quest details (e.g., target contract, required action) from `QuestRegistry` using `questId`.
            2.  Performs the verification check directly on-chain. For example, for a "Provide Liquidity" quest, it would check the user's balance of a specific LP token contract.
            3.  If the condition is met and the quest hasn't been completed before, it calls `_updateScore` to add points and records the quest as completed.
    * `function completeOffChainQuest(bytes32 questId, bytes memory reclaimProof)`:
        * **Action:** User calls this after generating a ZKP with the Reclaim Protocol.
        * **Logic:**
            1.  Retrieves quest details from `QuestRegistry`, including the expected provider and claim data (e.g., "Coursera", "Financial Literacy 101 certificate").
            2.  It will perform the on-chain verification of the `reclaimProof`. This involves calling the Reclaim Protocol's on-chain verifier contract, which confirms the proof's validity and the integrity of the data it contains.
            3.  If the proof is valid and pertains to the correct claim, the function updates the user's score and marks the quest as completed.

##### 3.1.2 `LendingPool.sol`
This contract manages the funds for micro-loans.
* **State Variables:**
    * `IERC20 public gDollarToken;`: The G$ token contract address.
    * `GoodCredScore public scoreContract;`: The address of the `GoodCredScore` contract.
    * `mapping(uint256 => Loan) private loans;`: Stores details of active loans.
    * `uint256 public loanTerm;`: The duration of a loan (e.g., 30 days).
    * `uint256 public interestFee;`: A simple, fixed fee for borrowing (e.g., 200 basis points = 2%).
* **Core Functions:**
    * `function deposit(uint256 amount)`:
        * **Action:** Allows supporters/liquidity providers to deposit G$ into the pool.
        * **Logic:** Transfers `amount` of G$ from `msg.sender` to this contract. Emits a `Deposit` event.
    * `function borrow(uint256 amount)`:
        * **Action:** Allows a user to take out a loan.
        * **Logic:**
            1.  **Checks score:** Calls `scoreContract.getScore(msg.sender)` to retrieve the user's score.
            2.  **Checks eligibility:** Reverts if the score is below the required threshold for the requested `amount`.
            3.  **Checks for existing loans:** Reverts if the user has an outstanding loan.
            4.  **Executes loan:** Records a new `Loan` struct for the user, transfers the G$ `amount` to them, and emits a `LoanTaken` event.
    * `function repay(uint256 loanId)`:
        * **Action:** User repays their loan.
        * **Logic:**
            1.  Calculates the total amount due (principal + interestFee).
            2.  Transfers the total amount of G$ from the `msg.sender` to the contract.
            3.  Marks the loan as repaid.
            4.  Calls `scoreContract.completeOnChainQuest()` with the `questId` for "Loan Repaid" to trigger a score increase for the user. Emits a `LoanRepaid` event.

##### 3.1.3 `QuestRegistry.sol`
An `Ownable` contract to manage Quest definitions, separating concerns and allowing for future upgrades.
* **State Variables:**
    * `mapping(bytes32 => Quest) private quests;`: Stores details of all quests.
* **Core Functions:**
    * `function addQuest(bytes32 questId, Quest calldata questData)` (Owner only): Adds a new quest.
    * `function updateQuest(bytes32 questId, Quest calldata questData)` (Owner only): Modifies an existing quest.
    * `function getQuest(bytes32 questId) public view returns (Quest memory)`: Returns details for a specific quest.

#### 3.2 Frontend Application (React dApp)

* **Onboarding & Dashboard View:**
    * Connect Wallet button (using RainbowKit, Web3Modal, or similar).
    * "Verify Identity" flow that integrates the GoodID SDK.
    * Once verified, displays the user's GoodCred Score prominently.
    * Shows a summary of active loans and repayment deadlines.
* **Quests View:**
    * Lists all available quests, separated into "On-Chain" and "Off-Chain" categories.
    * Each quest displays the score points it awards and its current completion status.
    * "Complete" button for on-chain quests triggers the corresponding smart contract call.
    * "Verify" button for off-chain quests initiates the Reclaim Protocol SDK flow.
* **Lending View:**
    * Displays the total G$ available in the lending pool.
    * An interface to request a loan, showing the maximum amount the user is eligible for based on their score.
    * An interface to repay an active loan.

#### 3.3 The Graph Subgraph

* **Purpose:** To provide a fast, indexed data source for the frontend.
* **Entities to Index:**
    * `UserProfile`: To track all users and their scores.
    * `QuestCompletion`: To track which users completed which quests.
    * `Loan`: To track all historical and active loans.
* **Event Handlers:** Will listen for `ProfileCreated`, `ScoreUpdated`, `LoanTaken`, `LoanRepaid` events from the smart contracts to update the entities.

---

### 4.0 Data Models

* **`struct UserProfile`** (in `GoodCredScore.sol`):
    * `address userAddress;`
    * `bool isVerified;` (via GoodID)
    * `uint256 score;`
    * `mapping(bytes32 => bool) completedQuests;`
* **`struct Loan`** (in `LendingPool.sol`):
    * `uint256 loanId;`
    * `address borrower;`
    * `uint256 principal;`
    * `uint256 amountDue;`
    * `uint256 dueDate;`
    * `bool isRepaid;`
* **`struct Quest`** (in `QuestRegistry.sol`):
    * `bytes32 questId;`
    * `string description;`
    * `uint256 scorePoints;`
    * `enum QuestType { ON_CHAIN, OFF_CHAIN }`
    * `address targetContract;` (For on-chain quests)
    * `string reclaimProvider;` (For off-chain quests, e.g., "Coursera")
    * `string reclaimClaimData;`

---

### 5.0 User Flows

#### 5.1 New User Onboarding & First Quest
1.  User lands on the dApp and connects their wallet.
2.  User clicks "Create My Score" and is prompted to go through the GoodID verification flow.
3.  The frontend SDK communicates with GoodID services. Upon success, it receives a proof.
4.  User signs a transaction to call `confirmGoodIdVerification()` with the proof.
5.  The smart contract verifies the proof, creates their profile, and awards the initial score. The user now sees their dashboard.

#### 5.2 Completing an Off-Chain (Reclaim) Quest
1.  User navigates to the "Quests" page and selects "Verify Coursera Certificate."
2.  The dApp initiates the Reclaim Protocol flow. The user is prompted to log in to Coursera through Reclaim's secure iframe/redirect.
3.  Reclaim generates a ZKP containing the claim data and returns it to the frontend.
4.  The user is prompted to sign a transaction to call `completeOffChainQuest()` with the quest ID and the ZKP.
5.  The smart contract verifies the proof and updates the user's score. The frontend reflects the new score and marks the quest as complete.

#### 5.3 Taking and Repaying a Loan
1.  A user with a score of 500+ navigates to the "Lending" page.
2.  The UI shows they are eligible to borrow up to 20,000 G$.
3.  They enter `20000` and click "Borrow." They sign the transaction to call `borrow()`.
4.  The `LendingPool` contract verifies their score with the `GoodCredScore` contract and transfers 20,000 G$ to them.
5.  Before the due date, the user returns to the page and clicks "Repay."
6.  They must first approve the `LendingPool` contract to spend their G$.
7.  They then sign the transaction to call `repay()`. The contract pulls the principal + fee from their wallet.
8.  The `repay` function automatically calls the `GoodCredScore` contract to credit them for repaying the loan, increasing their score further.

---

### 6.0 Security & Trust Model

* **Smart Contract Security:** All contracts will be developed using the checks-effects-interactions pattern to prevent re-entrancy. They will inherit from OpenZeppelin's `Ownable` and `ReentrancyGuard` contracts. All external contract calls will be treated as untrusted.
* **Admin Controls:** The `QuestRegistry` will be controlled by an owner address (initially the dev team, potentially a multi-sig or DAO in the future). This presents a centralization risk that must be transparently communicated.
* **Data Privacy:** User PII is never stored on-chain. Off-chain verification relies entirely on the privacy-preserving guarantees of the Reclaim Protocol.
* **Economic Security:** The lending pool is vulnerable to smart contract bugs and defaults. Initially, loan amounts will be kept small to minimize risk. A portion of the interest fees may be allocated to an insurance fund.

---

### 7.0 Future Work & Scalability

* **Dynamic Loan Terms:** Implement variable interest rates and loan amounts based on a user's score tier.
* **Third-Party Integration:** Allow other dApps on Celo to query the `GoodCredScore` contract to offer their own score-gated features (e.g., lower trading fees, premium access).
* **Expanded Quest Library:** Continuously add new on-chain and off-chain quests to provide more avenues for users to build their score.
* **Decentralized Governance:** Transition ownership of the `QuestRegistry` and key `LendingPool` parameters to a DAO governed by GoodCred users.