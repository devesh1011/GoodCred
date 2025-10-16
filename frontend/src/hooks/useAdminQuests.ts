"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useAccount } from "wagmi";
import { type QuestFormData } from "@/lib/questFormSchema";
import { formatQuestForContract } from "@/lib/adminUtils";

// Contract addresses
const CONTRACT_ADDRESSES = {
  QUEST_REGISTRY: "0x39e86627B3438D141ba581581Ae79416495EaC80",
} as const;

// Quest Registry ABI for admin functions
const QUEST_REGISTRY_ABI = [
  {
    inputs: [
      { name: "description", type: "string" },
      { name: "scorePoints", type: "uint256" },
      { name: "questType", type: "uint8" },
      { name: "targetContract", type: "address" },
      { name: "reclaimProvider", type: "string" },
      { name: "reclaimClaimData", type: "string" },
    ],
    name: "addQuest",
    outputs: [{ type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "questId", type: "bytes32" },
      { name: "description", type: "string" },
      { name: "scorePoints", type: "uint256" },
      { name: "questType", type: "uint8" },
      { name: "targetContract", type: "address" },
      { name: "reclaimProvider", type: "string" },
      { name: "reclaimClaimData", type: "string" },
    ],
    name: "updateQuest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "questId", type: "bytes32" }],
    name: "deactivateQuest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "questId", type: "bytes32" }],
    name: "activateQuest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/**
 * Hook for admin operations on quests (create, edit, deactivate)
 */
export function useAdminQuests() {
  const { address } = useAccount();
  const { writeContractAsync, isPending: isWriteLoading } = useWriteContract();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new quest
   */
  const createQuest = useCallback(
    async (formData: QuestFormData) => {
      if (!address) {
        console.error("Wallet not connected");
        setError("Wallet not connected");
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const contractData = formatQuestForContract(formData);

        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.QUEST_REGISTRY as `0x${string}`,
          abi: QUEST_REGISTRY_ABI,
          functionName: "addQuest",
          args: [
            contractData.description,
            contractData.scorePoints,
            contractData.questType,
            contractData.targetContract,
            contractData.reclaimProvider,
            contractData.reclaimClaimData,
          ],
        });

        console.log(`Quest created successfully! Hash: ${hash}`);
        return hash;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to create quest";
        setError(errorMsg);
        console.error("Create quest error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContractAsync]
  );

  /**
   * Update an existing quest
   */
  const updateQuest = useCallback(
    async (questId: `0x${string}`, formData: QuestFormData) => {
      if (!address) {
        console.error("Wallet not connected");
        setError("Wallet not connected");
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const contractData = formatQuestForContract(formData);

        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.QUEST_REGISTRY as `0x${string}`,
          abi: QUEST_REGISTRY_ABI,
          functionName: "updateQuest",
          args: [
            questId,
            contractData.description,
            contractData.scorePoints,
            contractData.questType,
            contractData.targetContract,
            contractData.reclaimProvider,
            contractData.reclaimClaimData,
          ],
        });

        console.log(`Quest updated successfully! Hash: ${hash}`);
        return hash;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to update quest";
        setError(errorMsg);
        console.error("Update quest error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContractAsync]
  );

  /**
   * Deactivate a quest
   */
  const deactivateQuest = useCallback(
    async (questId: `0x${string}`) => {
      if (!address) {
        console.error("Wallet not connected");
        setError("Wallet not connected");
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.QUEST_REGISTRY as `0x${string}`,
          abi: QUEST_REGISTRY_ABI,
          functionName: "deactivateQuest",
          args: [questId],
        });

        console.log("Quest deactivated successfully!");
        return hash;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to deactivate quest";
        setError(errorMsg);
        console.error("Deactivate quest error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContractAsync]
  );

  /**
   * Activate a quest
   */
  const activateQuest = useCallback(
    async (questId: `0x${string}`) => {
      if (!address) {
        console.error("Wallet not connected");
        setError("Wallet not connected");
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.QUEST_REGISTRY as `0x${string}`,
          abi: QUEST_REGISTRY_ABI,
          functionName: "activateQuest",
          args: [questId],
        });

        console.log("Quest activated successfully!");
        return hash;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to activate quest";
        setError(errorMsg);
        console.error("Activate quest error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContractAsync]
  );

  return {
    createQuest,
    updateQuest,
    deactivateQuest,
    activateQuest,
    isLoading: isLoading || isWriteLoading,
    error,
    clearError: () => setError(null),
  };
}
