"use client";

import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";

// Loan type definition
interface Loan {
  loanId: bigint;
  borrower: string;
  principal: bigint;
  amountDue: bigint;
  dueDate: bigint;
  isRepaid: boolean;
}

// Contract addresses (Celo Sepolia testnet)
const CONTRACT_ADDRESSES = {
  QUEST_REGISTRY: "0x39e86627B3438D141ba581581Ae79416495EaC80",
  GOOD_CRED_SCORE: "0x111EA01f8Ffc0d9d2bA88578a45d762672Db255a",
  LENDING_POOL: "0xd37F6A255eeb45dA0d6cD7743b3965e43CF93F50",
} as const;

// ABI snippets (you would import full ABIs in production)
const QUEST_REGISTRY_ABI = [
  {
    inputs: [],
    name: "getAllQuestIds",
    outputs: [{ type: "bytes32[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "questId", type: "bytes32" }],
    name: "getQuest",
    outputs: [
      {
        components: [
          { name: "questId", type: "bytes32" },
          { name: "description", type: "string" },
          { name: "scorePoints", type: "uint256" },
          { name: "questType", type: "uint8" }, // 0 = ON_CHAIN, 1 = OFF_CHAIN
          { name: "targetContract", type: "address" },
          { name: "reclaimProvider", type: "string" },
          { name: "reclaimClaimData", type: "string" },
          { name: "isActive", type: "bool" },
        ],
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "questId", type: "bytes32" }],
    name: "isQuestActive",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const GOOD_CRED_SCORE_ABI = [
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getScore",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "register",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "verifyIdentity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "questId", type: "bytes32" }],
    name: "completeOnChainQuest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "questId", type: "bytes32" },
      { name: "reclaimProof", type: "bytes" },
    ],
    name: "completeOffChainQuest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "isRegistered",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const LENDING_POOL_ABI = [
  {
    inputs: [],
    name: "totalDeposited",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "borrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "loanId", type: "uint256" }],
    name: "repay",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserLoan",
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "loanId", type: "uint256" },
          { name: "borrower", type: "address" },
          { name: "principal", type: "uint256" },
          { name: "amountDue", type: "uint256" },
          { name: "dueDate", type: "uint256" },
          { name: "isRepaid", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useGoodCredScore() {
  const { address } = useAccount();

  // Get user's credit score
  const {
    data: score,
    isLoading: scoreLoading,
    refetch: refetchScore,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.GOOD_CRED_SCORE as `0x${string}`,
    abi: GOOD_CRED_SCORE_ABI,
    functionName: "getScore",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Check if user is registered
  const { data: isRegistered, isLoading: registeredLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.GOOD_CRED_SCORE as `0x${string}`,
    abi: GOOD_CRED_SCORE_ABI,
    functionName: "isRegistered",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Register user
  const { writeContract: registerUser, isPending: registerLoading } =
    useWriteContract();

  const register = () => {
    if (!address) return;
    registerUser({
      address: CONTRACT_ADDRESSES.GOOD_CRED_SCORE as `0x${string}`,
      abi: GOOD_CRED_SCORE_ABI,
      functionName: "register",
    });
  };

  // Verify identity (calls smart contract to award +100 points)
  const { writeContract: verifyIdentityContract, isPending: verifyLoading } =
    useWriteContract();

  const verifyIdentity = () => {
    if (!address) return;
    verifyIdentityContract({
      address: CONTRACT_ADDRESSES.GOOD_CRED_SCORE as `0x${string}`,
      abi: GOOD_CRED_SCORE_ABI,
      functionName: "verifyIdentity",
    });
  };

  // Complete on-chain quest
  const {
    writeContract: completeOnChainQuestTx,
    isPending: onChainQuestLoading,
  } = useWriteContract();

  const completeOnChainQuest = (questId: string) => {
    if (!address) return;
    completeOnChainQuestTx({
      address: CONTRACT_ADDRESSES.GOOD_CRED_SCORE as `0x${string}`,
      abi: GOOD_CRED_SCORE_ABI,
      functionName: "completeOnChainQuest",
      args: [questId as `0x${string}`],
    });
  };

  // Complete off-chain quest with Reclaim proof
  const {
    writeContract: completeOffChainQuestTx,
    isPending: offChainQuestLoading,
  } = useWriteContract();

  const completeOffChainQuest = (
    questId: string,
    reclaimProof: `0x${string}`
  ) => {
    if (!address) return;
    completeOffChainQuestTx({
      address: CONTRACT_ADDRESSES.GOOD_CRED_SCORE as `0x${string}`,
      abi: GOOD_CRED_SCORE_ABI,
      functionName: "completeOffChainQuest",
      args: [questId as `0x${string}`, reclaimProof],
    });
  };

  return {
    score: score ? Number(score) : 0,
    scoreLoading,
    isRegistered: isRegistered || false,
    registeredLoading,
    register,
    registerLoading,
    verifyIdentity,
    verifyLoading,
    completeOnChainQuest,
    onChainQuestLoading,
    completeOffChainQuest,
    offChainQuestLoading,
    refetchScore,
  };
}

export function useLendingPool() {
  const { address } = useAccount();

  // Get total deposited amount
  const { data: totalDeposited, isLoading: totalLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.LENDING_POOL as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: "totalDeposited",
  });

  // Get user's active loan
  const {
    data: userLoan,
    isLoading: loanLoading,
    refetch: refetchLoan,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.LENDING_POOL as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: "getUserLoan",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Deposit G$ tokens
  const { writeContract: depositTokens, isPending: depositLoading } =
    useWriteContract();

  const deposit = (amount: string) => {
    depositTokens({
      address: CONTRACT_ADDRESSES.LENDING_POOL as `0x${string}`,
      abi: LENDING_POOL_ABI,
      functionName: "deposit",
      args: [parseEther(amount)],
    });
  };

  // Borrow G$ tokens
  const { writeContract: borrowTokens, isPending: borrowLoading } =
    useWriteContract();

  const borrow = (amount: string) => {
    borrowTokens({
      address: CONTRACT_ADDRESSES.LENDING_POOL as `0x${string}`,
      abi: LENDING_POOL_ABI,
      functionName: "borrow",
      args: [parseEther(amount)],
    });
  };

  // Repay loan
  const { writeContract: repayLoan, isPending: repayLoading } =
    useWriteContract();

  const repay = (loanId: number) => {
    repayLoan({
      address: CONTRACT_ADDRESSES.LENDING_POOL as `0x${string}`,
      abi: LENDING_POOL_ABI,
      functionName: "repay",
      args: [BigInt(loanId)],
    });
  };

  return {
    totalDeposited: totalDeposited ? formatEther(totalDeposited) : "0",
    totalLoading,
    userLoan: userLoan as Loan | undefined,
    loanLoading,
    hasActiveLoan: userLoan ? !(userLoan as Loan).isRepaid : false,
    deposit,
    depositLoading,
    borrow,
    borrowLoading,
    repay,
    repayLoading,
    refetchLoan,
  };
}

export function useQuestRegistry() {
  const { isConnected } = useAccount();

  // Get all quest IDs
  const {
    data: questIds,
    isLoading: questsLoading,
    refetch: refetchQuestIds,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.QUEST_REGISTRY as `0x${string}`,
    abi: QUEST_REGISTRY_ABI,
    functionName: "getAllQuestIds",
    query: {
      enabled: isConnected,
    },
  });

  return {
    questIds: (questIds as readonly `0x${string}`[]) || [],
    questsLoading,
    refetchQuestIds,
  };
}

// Hook to get a single quest by ID
export function useQuest(questId: `0x${string}` | undefined) {
  const { isConnected } = useAccount();

  const {
    data: questData,
    isLoading: questLoading,
    refetch: refetchQuest,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.QUEST_REGISTRY as `0x${string}`,
    abi: QUEST_REGISTRY_ABI,
    functionName: "getQuest",
    args: questId ? [questId] : undefined,
    query: {
      enabled: isConnected && !!questId,
    },
  });

  return {
    quest: questData,
    questLoading,
    refetchQuest,
  };
}
