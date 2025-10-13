"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Coins,
  Trophy,
  TrendingUp,
  Vote,
  GraduationCap,
  Users,
} from "lucide-react";

type QuestStatus = "available" | "in-progress" | "completed";
type QuestCategory = "all" | "on-chain" | "off-chain";

interface Quest {
  id: number;
  title: string;
  description: string;
  points: number;
  category: "on-chain" | "off-chain";
  status: QuestStatus;
  icon: typeof Coins;
}

const questsData: Quest[] = [
  {
    id: 1,
    title: "Provide G$ on Ubeswap",
    description:
      "Add liquidity to the G$ pool on Ubeswap and earn rewards while helping the ecosystem grow.",
    points: 100,
    category: "on-chain",
    status: "available",
    icon: Coins,
  },
  {
    id: 2,
    title: "Verify Financial Literacy",
    description:
      "Complete a financial literacy course and submit your certificate via Reclaim Protocol.",
    points: 75,
    category: "off-chain",
    status: "completed",
    icon: GraduationCap,
  },
  {
    id: 3,
    title: "Complete First Trade",
    description:
      "Make your first trade on a Celo DEX to demonstrate basic DeFi knowledge.",
    points: 50,
    category: "on-chain",
    status: "completed",
    icon: TrendingUp,
  },
  {
    id: 4,
    title: "Vote in GoodDAO Proposal",
    description: "Participate in governance by voting on a GoodDAO proposal.",
    points: 25,
    category: "on-chain",
    status: "completed",
    icon: Vote,
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
  },
  {
    id: 6,
    title: "Refer a Friend",
    description:
      "Invite friends to join GoodCred and earn points when they complete verification.",
    points: 30,
    category: "off-chain",
    status: "in-progress",
    icon: Users,
  },
  {
    id: 7,
    title: "Complete KYC Verification",
    description: "Verify your identity using GoodID to unlock more features.",
    points: 100,
    category: "off-chain",
    status: "completed",
    icon: Trophy,
  },
  {
    id: 8,
    title: "Stake G$ Tokens",
    description: "Stake your G$ tokens for a minimum period to earn rewards.",
    points: 75,
    category: "on-chain",
    status: "available",
    icon: Coins,
  },
];

export default function QuestsPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<QuestCategory>("all");

  const filteredQuests = questsData.filter(
    (quest) => selectedCategory === "all" || quest.category === selectedCategory
  );

  const getStatusBadge = (status: QuestStatus) => {
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

  const getActionButton = (status: QuestStatus) => {
    switch (status) {
      case "completed":
        return (
          <Button disabled className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </Button>
        );
      case "in-progress":
        return <Button variant="outline">Verify</Button>;
      default:
        return <Button>Start Task</Button>;
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

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          <Button
            variant={selectedCategory === "on-chain" ? "default" : "outline"}
            onClick={() => setSelectedCategory("on-chain")}
          >
            On-Chain
          </Button>
          <Button
            variant={selectedCategory === "off-chain" ? "default" : "outline"}
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
                {filteredQuests.reduce((acc, quest) => acc + quest.points, 0)}
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
                {filteredQuests.filter((q) => q.status === "completed").length}{" "}
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
                        <h3 className="text-lg font-semibold">{quest.title}</h3>
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
                      {getActionButton(quest.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
