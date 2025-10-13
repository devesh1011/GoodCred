"use client";

import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";

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
] as const;

export function useGoodCredScore() {
  const { address } = useAccount();

  // Get user's credit score
  const { data: score, isLoading: scoreLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.GOOD_CRED_SCORE as `0x${string}`,
    abi: GOOD_CRED_SCORE_ABI,
    functionName: "getScore",
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

  return {
    score: score ? Number(score) : 0,
    scoreLoading,
    register,
    registerLoading,
    verifyIdentity,
    verifyLoading,
  };
}

export function useLendingPool() {
  // Get total deposited amount
  const { data: totalDeposited, isLoading: totalLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.LENDING_POOL as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: "totalDeposited",
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

  return {
    totalDeposited: totalDeposited ? formatEther(totalDeposited) : "0",
    totalLoading,
    deposit,
    depositLoading,
  };
}

export function useQuestRegistry() {
  // Get all quest IDs
  const { data: questIds, isLoading: questsLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.QUEST_REGISTRY as `0x${string}`,
    abi: QUEST_REGISTRY_ABI,
    functionName: "getAllQuestIds",
  });

  return {
    questIds: questIds || [],
    questsLoading,
  };
}
