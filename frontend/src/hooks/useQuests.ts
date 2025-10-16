"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { useQuestRegistry } from "@/hooks/useGoodCred";
import {
  type ContractQuest,
  type UIQuest,
  contractQuestToUI,
  getMockQuests,
} from "@/lib/questUtils";

// Contract addresses
const CONTRACT_ADDRESSES = {
  QUEST_REGISTRY: "0x39e86627B3438D141ba581581Ae79416495EaC80",
} as const;

// Quest Registry ABI for getQuest
const QUEST_REGISTRY_ABI = [
  {
    inputs: [{ name: "questId", type: "bytes32" }],
    name: "getQuest",
    outputs: [
      {
        components: [
          { name: "questId", type: "bytes32" },
          { name: "description", type: "string" },
          { name: "scorePoints", type: "uint256" },
          { name: "questType", type: "uint8" },
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
] as const;

/**
 * Custom hook to manage quests with dynamic loading from contract
 * and local persistence of quest status
 */
export function useQuests() {
  const { isConnected, address } = useAccount();
  const { questIds } = useQuestRegistry();
  const [quests, setQuests] = useState<UIQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);

  // Load quest completion status from localStorage
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(
    new Set()
  );
  const [inProgressQuests, setInProgressQuests] = useState<Set<string>>(
    new Set()
  );

  // Track if we've loaded contract quests to avoid re-processing
  const questsProcessedRef = useRef(false);
  const completedQuestsRef = useRef<Set<string>>(new Set());
  const inProgressQuestsRef = useRef<Set<string>>(new Set());

  // Update refs whenever the states change
  useEffect(() => {
    completedQuestsRef.current = completedQuests;
    inProgressQuestsRef.current = inProgressQuests;
  }, [completedQuests, inProgressQuests]);

  // Prepare batch contract reads for all quest IDs
  const questContracts = (questIds || []).map((questId) => ({
    address: CONTRACT_ADDRESSES.QUEST_REGISTRY as `0x${string}`,
    abi: QUEST_REGISTRY_ABI,
    functionName: "getQuest" as const,
    args: [questId],
  }));

  // Batch read all quests using useReadContracts
  const {
    data: questsData,
    isLoading: questsLoading,
    isSuccess: questsSuccess,
  } = useReadContracts({
    contracts: questContracts,
    query: {
      enabled: isConnected && questIds !== undefined && questIds.length > 0,
    },
  });

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !address) return;

    const storageKey = `quest_status_${address}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const { completed, inProgress } = JSON.parse(saved);
        setCompletedQuests(new Set(completed || []));
        setInProgressQuests(new Set(inProgress || []));
      } catch (error) {
        console.error("Error loading quest status:", error);
      }
    }
  }, [address]);

  // Save to localStorage whenever status changes
  useEffect(() => {
    if (typeof window === "undefined" || !address) return;

    const storageKey = `quest_status_${address}`;
    const data = {
      completed: Array.from(completedQuests),
      inProgress: Array.from(inProgressQuests),
    };

    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [completedQuests, inProgressQuests, address]);

  // Load quests from contract or use mock data
  useEffect(() => {
    const loadQuests = async () => {
      if (!isConnected) {
        // Not connected - use mock data
        setQuests(getMockQuests());
        setLoading(false);
        setUseMockData(true);
        questsProcessedRef.current = false;
        return;
      }

      if (questsLoading) {
        setLoading(true);
        return; // Still loading quest data
      }

      if (!questIds || questIds.length === 0) {
        // No quests in contract - use mock data
        console.log("No quests found in contract, using mock data");
        setQuests(getMockQuests());
        setLoading(false);
        setUseMockData(true);
        questsProcessedRef.current = false;
        return;
      }

      // Only process once when contract data is ready
      if (questsProcessedRef.current) {
        return;
      }

      // Load quests from contract batch data
      try {
        if (questsSuccess && questsData) {
          console.log(
            `Processing ${questsData.length} quests from contract...`
          );

          // Filter out failed reads and extract results
          const validQuests = questsData
            .filter(
              (
                result
              ): result is { status: "success"; result: ContractQuest } =>
                result.status === "success" && result.result !== undefined
            )
            .map((result) => result.result);

          if (validQuests.length > 0) {
            const uiQuests = validQuests.map((quest, index) =>
              contractQuestToUI(
                quest,
                index,
                completedQuestsRef.current,
                inProgressQuestsRef.current
              )
            );

            console.log(
              `Successfully loaded ${uiQuests.length} quests from contract`
            );
            setQuests(uiQuests);
            setUseMockData(false);
            questsProcessedRef.current = true;
          } else {
            // No valid quests loaded, fall back to mock
            console.log("No valid quests loaded, using mock data");
            setQuests(getMockQuests());
            setUseMockData(true);
            questsProcessedRef.current = true;
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error processing quests:", error);
        setQuests(getMockQuests());
        setUseMockData(true);
        setLoading(false);
        questsProcessedRef.current = true;
      }
    };

    loadQuests();
  }, [
    isConnected,
    questIds,
    questsLoading,
    questsSuccess,
    questsData,
  ]);

  // Mark quest as in progress
  const markQuestInProgress = (questId: string) => {
    setInProgressQuests((prev) => new Set([...prev, questId]));
  };

  // Mark quest as completed
  const markQuestCompleted = (questId: string) => {
    setCompletedQuests((prev) => new Set([...prev, questId]));
    setInProgressQuests((prev) => {
      const next = new Set(prev);
      next.delete(questId);
      return next;
    });
  };

  // Get quest status
  const getQuestStatus = (
    questId: string
  ): "available" | "in-progress" | "completed" => {
    if (completedQuests.has(questId)) return "completed";
    if (inProgressQuests.has(questId)) return "in-progress";
    return "available";
  };

  // Update quest status in the quests array
  const updateQuestStatus = (
    questId: number | string,
    status: "available" | "in-progress" | "completed"
  ) => {
    setQuests((prevQuests) =>
      prevQuests.map((quest) => {
        const matchesId =
          typeof questId === "number"
            ? quest.id === questId
            : quest.contractQuestId === questId;

        return matchesId ? { ...quest, status } : quest;
      })
    );

    // Also update localStorage
    if (typeof questId === "string") {
      if (status === "completed") {
        markQuestCompleted(questId);
      } else if (status === "in-progress") {
        markQuestInProgress(questId);
      }
    }
  };

  return {
    quests,
    loading,
    useMockData,
    completedQuests,
    inProgressQuests,
    markQuestInProgress,
    markQuestCompleted,
    getQuestStatus,
    updateQuestStatus,
  };
}
