import { type QuestFormData } from "./questFormSchema";
import { type ContractQuest } from "./questUtils";

/**
 * Convert form data to contract-compatible format
 */
export function formatQuestForContract(data: QuestFormData) {
  const questType = data.questType === "ON_CHAIN" ? 0 : 1;

  return {
    description: data.description,
    scorePoints: BigInt(data.targetPoints),
    questType,
    targetContract:
      data.questType === "ON_CHAIN"
        ? (data.targetContract as `0x${string}`)
        : ("0x0000000000000000000000000000000000000000" as `0x${string}`),
    reclaimProvider: data.reclaimProvider || "",
    reclaimClaimData: data.reclaimDataKey || "",
  };
}

/**
 * Convert contract quest to form data for editing
 */
export function formatQuestForDisplay(
  quest: ContractQuest
): Partial<QuestFormData> {
  const questType = quest.questType === 0 ? "ON_CHAIN" : "OFF_CHAIN";

  return {
    description: quest.description,
    targetPoints: Number(quest.scorePoints),
    questType,
    targetContract:
      questType === "ON_CHAIN"
        ? quest.targetContract
        : ("0x0000000000000000000000000000000000000000" as `0x${string}`),
    reclaimProvider: quest.reclaimProvider,
    reclaimDataKey: quest.reclaimClaimData,
    isActive: quest.isActive,
  };
}

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Truncate Ethereum address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!isValidEthereumAddress(address)) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-(chars))}`;
}

/**
 * Format quest display info
 */
export interface FormattedQuestDisplay {
  id: string;
  description: string;
  points: number;
  type: string;
  target: string; // Contract address or provider name
  status: string;
}

export function formatQuestForDisplay2(
  quest: ContractQuest,
  questId: string
): FormattedQuestDisplay {
  const questType = quest.questType === 0 ? "On-Chain" : "Off-Chain";
  const target =
    questType === "On-Chain"
      ? truncateAddress(quest.targetContract)
      : quest.reclaimProvider;

  return {
    id: questId,
    description: quest.description,
    points: Number(quest.scorePoints),
    type: questType,
    target,
    status: quest.isActive ? "Active" : "Inactive",
  };
}

/**
 * Get color for quest type badge
 */
export function getQuestTypeBadgeColor(
  questType: "ON_CHAIN" | "OFF_CHAIN"
): string {
  return questType === "ON_CHAIN"
    ? "bg-blue-100 text-blue-800"
    : "bg-purple-100 text-purple-800";
}

/**
 * Get color for status badge
 */
export function getStatusBadgeColor(isActive: boolean): string {
  return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
}
