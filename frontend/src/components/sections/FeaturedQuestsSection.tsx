"use client";

import {
  ContainerScroll,
  CardsContainer,
  CardTransformed,
} from "@/components/blocks/animated-cards-stack";
import { CheckCircle2, Coins, Trophy, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const questsData = [
  {
    title: "Provide G$ on Ubeswap",
    description:
      "Add liquidity to the G$ pool on Ubeswap and earn rewards while helping the ecosystem.",
    points: "+100 Points",
    category: "On-Chain",
    icon: Coins,
  },
  {
    title: "Verify Financial Literacy",
    description:
      "Complete a financial literacy course and submit your certificate via Reclaim Protocol.",
    points: "+75 Points",
    category: "Off-Chain",
    icon: Trophy,
  },
  {
    title: "Complete First Trade",
    description:
      "Make your first trade on a Celo DEX to demonstrate basic DeFi knowledge.",
    points: "+50 Points",
    category: "On-Chain",
    icon: TrendingUp,
  },
  {
    title: "Vote in GoodDAO",
    description: "Participate in governance by voting on a GoodDAO proposal.",
    points: "+25 Points",
    category: "On-Chain",
    icon: CheckCircle2,
  },
];

export default function FeaturedQuestsSection() {
  return (
    <div className="w-full py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-8 mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-center">
            Featured Quests
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl">
            Complete these tasks to boost your credit score and unlock better
            loan terms. Scroll slowly to explore each quest in detail.
          </p>
        </div>

        <ContainerScroll className="min-h-[1200px]">
          <CardsContainer className="h-[500px] w-full max-w-4xl mx-auto">
            {questsData.map((quest, index) => {
              const Icon = quest.icon;
              return (
                <CardTransformed
                  key={index}
                  index={index}
                  arrayLength={questsData.length}
                  variant="light"
                  incrementY={20}
                  incrementZ={20}
                  incrementRotation={-3}
                >
                  <div className="w-full h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                        <Icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <Badge variant="secondary">{quest.category}</Badge>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-foreground">
                        {quest.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {quest.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                        {quest.points}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Scroll down to see more quests →
                      </span>
                    </div>
                  </div>
                </CardTransformed>
              );
            })}
          </CardsContainer>
        </ContainerScroll>
      </div>
    </div>
  );
}
