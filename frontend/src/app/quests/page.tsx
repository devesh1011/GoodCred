"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Loader2, Shield, Info } from "lucide-react";
import { useGoodCredScore } from "@/hooks/useGoodCred";
import { useAccount } from "wagmi";
import { useQuests } from "@/hooks/useQuests";
import { type UIQuest } from "@/lib/questUtils";
import {
  initializeReclaimRequest,
  startReclaimVerification,
  serializeProofForContract,
} from "@/lib/reclaim";

type QuestCategory = "all" | "on-chain" | "off-chain";

export default function QuestsPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<QuestCategory>("all");
  const [verifyingQuestId, setVerifyingQuestId] = useState<number | null>(null);
  const { isConnected, address } = useAccount();
  const {
    completeOnChainQuest,
    onChainQuestLoading,
    completeOffChainQuest,
    offChainQuestLoading,
    refetchScore,
  } = useGoodCredScore();

  // Use new dynamic quest loading hook
  const {
    quests: questsData,
    loading: questsLoading,
    useMockData,
    updateQuestStatus,
  } = useQuests();

  const filteredQuests = questsData.filter(
    (quest) => selectedCategory === "all" || quest.category === selectedCategory
  );

  const handleCompleteQuest = async (quest: UIQuest) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!address) {
      alert("Unable to get wallet address");
      return;
    }

    // Mark quest as in-progress
    if (quest.status === "available" && quest.contractQuestId) {
      updateQuestStatus(quest.contractQuestId, "in-progress");
    }

    if (quest.category === "on-chain") {
      try {
        // Convert quest ID to bytes32 format
        const questId =
          quest.contractQuestId || `0x${quest.id.toString().padStart(64, "0")}`;
        await completeOnChainQuest(questId);

        // Mark as completed in localStorage
        if (quest.contractQuestId) {
          updateQuestStatus(quest.contractQuestId, "completed");
        }

        // Refresh score after transaction
        setTimeout(() => {
          refetchScore();
        }, 3000);

        alert("Quest completed! Your credit score has been updated.");
      } catch (error) {
        console.error("Error completing on-chain quest:", error);
        alert("Failed to complete quest. Please try again.");
      }
    } else {
      // Off-chain quest - use Reclaim Protocol for verification
      try {
        setVerifyingQuestId(quest.id);

        // Check if quest has a Reclaim provider ID
        if (!quest.reclaimProviderId) {
          alert(
            "This quest doesn't have a verification provider configured yet. Coming soon!"
          );
          setVerifyingQuestId(null);
          return;
        }

        // Initialize Reclaim request with context
        const reclaimRequest = await initializeReclaimRequest(
          quest.reclaimProviderId,
          {
            questId: quest.id.toString(),
            userAddress: address,
            questTitle: quest.title,
          }
        );

        // Start verification flow
        await startReclaimVerification(
          reclaimRequest,
          async (proofs) => {
            try {
              // Serialize proof for contract submission
              const serializedProof = serializeProofForContract(proofs[0]);

              // Convert quest ID to bytes32 format
              const questId =
                quest.contractQuestId ||
                `0x${quest.id.toString().padStart(64, "0")}`;

              // Submit proof to contract
              await completeOffChainQuest(
                questId,
                serializedProof as `0x${string}`
              );

              // Mark as completed in localStorage
              if (quest.contractQuestId) {
                updateQuestStatus(quest.contractQuestId, "completed");
              }

              // Refresh score after successful verification
              setTimeout(() => {
                refetchScore();
              }, 3000);

              alert(
                "Quest completed successfully! Your credit score has been updated."
              );
            } catch (error) {
              console.error("Error submitting proof to contract:", error);
              alert(
                "Verification succeeded but failed to submit to contract. Please try again."
              );
            } finally {
              setVerifyingQuestId(null);
            }
          },
          (error) => {
            console.error("Reclaim verification failed:", error);
            alert("Verification failed. Please try again.");
            setVerifyingQuestId(null);
          }
        );
      } catch (error) {
        console.error("Error starting Reclaim verification:", error);
        alert("Failed to start verification. Please check your configuration.");
        setVerifyingQuestId(null);
      }
    }
  };

  const getStatusBadge = (
    status: "available" | "in-progress" | "completed"
  ) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Completed
          </Badge>
        );
      case "in-progress":
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return null;
    }
  };

  const getActionButton = (quest: UIQuest) => {
    const isLoading =
      onChainQuestLoading ||
      offChainQuestLoading ||
      verifyingQuestId === quest.id;

    switch (quest.status) {
      case "completed":
        return (
          <Button disabled className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </Button>
        );
      case "in-progress":
        return (
          <Button
            variant="outline"
            onClick={() => handleCompleteQuest(quest)}
            disabled={isLoading || !isConnected}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {quest.category === "off-chain"
                  ? "Verifying with Reclaim..."
                  : "Verifying..."}
              </>
            ) : (
              <>
                {quest.category === "off-chain" && (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Verify
              </>
            )}
          </Button>
        );
      default:
        return (
          <Button
            onClick={() => handleCompleteQuest(quest)}
            disabled={isLoading || !isConnected}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {quest.category === "off-chain"
                  ? "Starting Reclaim..."
                  : "Processing..."}
              </>
            ) : (
              <>
                {quest.category === "off-chain" && (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Start Task
              </>
            )}
          </Button>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Quests</h1>
          <p className="text-lg text-muted-foreground">
            Complete quests to increase your credit score and unlock better loan
            terms
          </p>
        </div>

        {/* Mock Data Indicator */}
        {useMockData && (
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {isConnected
                ? "No quests found in contract. Displaying demo quests for preview."
                : "Connect your wallet to load quests from the blockchain. Showing demo quests for now."}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {questsLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading quests from blockchain...</span>
            </div>
            {/* Skeleton Cards */}
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4 items-center">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-full max-w-md" />
                      </div>
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        {!questsLoading && (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              <Button
                variant={
                  selectedCategory === "on-chain" ? "default" : "outline"
                }
                onClick={() => setSelectedCategory("on-chain")}
              >
                On-Chain
              </Button>
              <Button
                variant={
                  selectedCategory === "off-chain" ? "default" : "outline"
                }
                onClick={() => setSelectedCategory("off-chain")}
              >
                Off-Chain
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Points Available
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredQuests.reduce(
                      (acc, quest) => acc + quest.points,
                      0
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed Quests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      filteredQuests.filter((q) => q.status === "completed")
                        .length
                    }{" "}
                    / {filteredQuests.length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Points Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                    {filteredQuests
                      .filter((q) => q.status === "completed")
                      .reduce((acc, quest) => acc + quest.points, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quests List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredQuests.map((quest) => {
                const Icon = quest.icon;
                return (
                  <Card
                    key={quest.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        {/* Icon */}
                        <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex-shrink-0">
                          <Icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {quest.title}
                            </h3>
                            <Badge variant="outline" className="capitalize">
                              {quest.category}
                            </Badge>
                            {getStatusBadge(quest.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {quest.description}
                          </p>
                        </div>

                        {/* Points and Action */}
                        <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                          <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                            +{quest.points} Points
                          </div>
                          {getActionButton(quest)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
