"use client";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Shield, Target, DollarSign } from "lucide-react";

const features = [
  {
    Icon: Shield,
    name: "Verify Your Identity",
    description:
      "Quick, private face scan powered by GoodID to prove you're a unique person. Your privacy is protected with zero-knowledge proofs.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
    ),
  },
  {
    Icon: Target,
    name: "Build Your Score",
    description:
      "Complete simple on-chain and off-chain quests to increase your credit score. Each completed task boosts your reputation.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
    ),
  },
  {
    Icon: DollarSign,
    name: "Unlock Loans",
    description:
      "Access decentralized loans in G$ based on your credit score. Higher scores unlock larger loan amounts with better terms.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <div className="w-full py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-8 mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-center">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl">
            Build your on-chain credit in three simple steps
          </p>
        </div>
        <BentoGrid className="lg:grid-rows-1">
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}
