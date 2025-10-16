"use client";

import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";

// Contract addresses
const CONTRACT_ADDRESSES = {
  QUEST_REGISTRY: "0x39e86627B3438D141ba581581Ae79416495EaC80",
} as const;

// Minimal ABI for owner() function
const OWNER_ABI = [
  {
    inputs: [],
    name: "owner",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Hook to check if the connected wallet is the QuestRegistry owner
 * Used for access control to admin pages
 */
export function useOwnerCheck() {
  const { address } = useAccount();

  const {
    data: owner,
    isLoading,
    error,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.QUEST_REGISTRY as `0x${string}`,
    abi: OWNER_ABI,
    functionName: "owner",
    query: {
      retry: 1,
      enabled: !!CONTRACT_ADDRESSES.QUEST_REGISTRY,
    },
  });

  const isOwner =
    address && owner
      ? address.toLowerCase() === (owner as string).toLowerCase()
      : false;

  return {
    isOwner,
    currentOwner: (owner as string) || null,
    connectedWallet: address,
    isLoading,
    error,
    isConnected: !!address,
  };
}
