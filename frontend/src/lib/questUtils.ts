import {
  Coins,
  GraduationCap,
  TrendingUp,
  Vote,
  CheckCircle2,
  Users,
  Trophy,
  type LucideIcon,
} from "lucide-react";

// Quest type from smart contract
export interface ContractQuest {
  questId: `0x${string}`;
  description: string;
  scorePoints: bigint;
  questType: number; // 0 = ON_CHAIN, 1 = OFF_CHAIN
  targetContract: `0x${string}`;
  reclaimProvider: string;
  reclaimClaimData: string;
  isActive: boolean;
}

// Quest type for UI
export interface UIQuest {
  id: number;
  title: string;
  description: string;
  points: number;
  category: "on-chain" | "off-chain";
  status: "available" | "in-progress" | "completed";
  icon: LucideIcon;
  reclaimProviderId?: string;
  contractQuestId?: `0x${string}`; // Link back to contract
}

// Convert contract quest to UI quest
export function contractQuestToUI(
  contractQuest: ContractQuest,
  index: number,
  userCompletedQuests?: Set<string>,
  userInProgressQuests?: Set<string>
): UIQuest {
  const questIdString = contractQuest.questId;

  // Determine status based on user's quest history
  let status: "available" | "in-progress" | "completed" = "available";
  if (userCompletedQuests?.has(questIdString)) {
    status = "completed";
  } else if (userInProgressQuests?.has(questIdString)) {
    status = "in-progress";
  }

  // Map quest type to category
  const category: "on-chain" | "off-chain" =
    contractQuest.questType === 0 ? "on-chain" : "off-chain";

  // Choose icon based on description keywords (fallback to default)
  const icon = getIconForQuest(contractQuest.description);

  // Extract title from description (first sentence or up to 50 chars)
  const title = extractTitle(contractQuest.description);

  return {
    id: index + 1,
    title,
    description: contractQuest.description,
    points: Number(contractQuest.scorePoints),
    category,
    status,
    icon,
    reclaimProviderId:
      category === "off-chain" ? contractQuest.reclaimProvider : undefined,
    contractQuestId: contractQuest.questId,
  };
}

// Extract title from description
function extractTitle(description: string): string {
  // Try to get first sentence
  const firstSentence = description.split(/[.!?]/)[0];
  if (firstSentence && firstSentence.length <= 60) {
    return firstSentence.trim();
  }

  // Otherwise, take first 50 characters
  if (description.length <= 50) {
    return description;
  }

  return description.substring(0, 50).trim() + "...";
}

// Map description keywords to icons
function getIconForQuest(description: string): LucideIcon {
  const lower = description.toLowerCase();

  if (
    lower.includes("liquidity") ||
    lower.includes("provide") ||
    lower.includes("ubeswap")
  ) {
    return Coins;
  }
  if (
    lower.includes("education") ||
    lower.includes("literacy") ||
    lower.includes("course") ||
    lower.includes("learn")
  ) {
    return GraduationCap;
  }
  if (
    lower.includes("trade") ||
    lower.includes("swap") ||
    lower.includes("dex")
  ) {
    return TrendingUp;
  }
  if (
    lower.includes("vote") ||
    lower.includes("governance") ||
    lower.includes("dao")
  ) {
    return Vote;
  }
  if (
    lower.includes("repay") ||
    lower.includes("loan") ||
    lower.includes("complete")
  ) {
    return CheckCircle2;
  }
  if (
    lower.includes("refer") ||
    lower.includes("friend") ||
    lower.includes("invite")
  ) {
    return Users;
  }
  if (
    lower.includes("kyc") ||
    lower.includes("verify") ||
    lower.includes("identity")
  ) {
    return Trophy;
  }

  // Default icon
  return Coins;
}

// Convert quest ID number to bytes32 format
export function questIdToBytes32(id: number): `0x${string}` {
  return `0x${id.toString().padStart(64, "0")}`;
}

// Convert bytes32 to number (for display)
export function bytes32ToQuestId(bytes32: `0x${string}`): number {
  // Remove 0x prefix and leading zeros
  const hex = bytes32.slice(2).replace(/^0+/, "");
  return parseInt(hex, 16) || 0;
}

// Generate mock quests for fallback when contract is not available
export function getMockQuests(): UIQuest[] {
  return [
    {
      id: 1,
      title: "Provide G$ on Ubeswap",
      description:
        "Add liquidity to the G$ pool on Ubeswap and earn rewards while helping the ecosystem grow.",
      points: 100,
      category: "on-chain",
      status: "available",
      icon: Coins,
      contractQuestId: questIdToBytes32(1),
    },
    {
      id: 2,
      title: "Verify Financial Literacy",
      description:
        "Complete a financial literacy course and submit your certificate via Reclaim Protocol.",
      points: 75,
      category: "off-chain",
      status: "available",
      icon: GraduationCap,
      reclaimProviderId: process.env.NEXT_PUBLIC_RECLAIM_GITHUB_PROVIDER,
      contractQuestId: questIdToBytes32(2),
    },
    {
      id: 3,
      title: "Complete First Trade",
      description:
        "Make your first trade on a Celo DEX to demonstrate basic DeFi knowledge.",
      points: 50,
      category: "on-chain",
      status: "available",
      icon: TrendingUp,
      contractQuestId: questIdToBytes32(3),
    },
    {
      id: 4,
      title: "Vote in GoodDAO Proposal",
      description: "Participate in governance by voting on a GoodDAO proposal.",
      points: 25,
      category: "on-chain",
      status: "available",
      icon: Vote,
      contractQuestId: questIdToBytes32(4),
    },
    {
      id: 5,
      title: "Repay a Loan on Time",
      description:
        "Successfully repay your first loan before the deadline to build trust.",
      points: 50,
      category: "on-chain",
      status: "available",
      icon: CheckCircle2,
      contractQuestId: questIdToBytes32(5),
    },
    {
      id: 6,
      title: "Refer a Friend",
      description:
        "Invite friends to join GoodCred and earn points when they complete verification.",
      points: 30,
      category: "off-chain",
      status: "available",
      icon: Users,
      reclaimProviderId: process.env.NEXT_PUBLIC_RECLAIM_TWITTER_PROVIDER,
      contractQuestId: questIdToBytes32(6),
    },
    {
      id: 7,
      title: "Complete KYC Verification",
      description: "Verify your identity using GoodID to unlock more features.",
      points: 100,
      category: "off-chain",
      status: "available",
      icon: Trophy,
      contractQuestId: questIdToBytes32(7),
    },
    {
      id: 8,
      title: "Stake G$ Tokens",
      description: "Stake your G$ tokens for a minimum period to earn rewards.",
      points: 75,
      category: "on-chain",
      status: "available",
      icon: Coins,
      contractQuestId: questIdToBytes32(8),
    },
  ];
}
