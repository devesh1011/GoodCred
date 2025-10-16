"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, TrendingUp, Trophy, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useGoodCredScore, useLendingPool } from "@/hooks/useGoodCred";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import GoodIDVerification from "@/components/GoodIDVerification";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const {
    score,
    scoreLoading,
    isRegistered,
    registeredLoading,
    register,
    registerLoading,
  } = useGoodCredScore();
  const { totalDeposited, totalLoading } = useLendingPool();
  const queryClient = useQueryClient();

  // Mock data for now - will be replaced with contract data
  const hasLoan = false;
  const loanAmount = 0;
  const repaymentDeadline = "";
  const completedQuests = 5;
  const totalQuests = 20;
  const questProgress = (completedQuests / totalQuests) * 100;

  const recentActivity = [
    {
      id: 1,
      text: "+50 Points: Quest 'Loan Repaid' Completed",
      time: "2 hours ago",
    },
    { id: 2, text: "+25 Points: Voted in GoodDAO Proposal", time: "1 day ago" },
    {
      id: 3,
      text: "+75 Points: Financial Literacy Verified",
      time: "3 days ago",
    },
    { id: 4, text: "+100 Points: Provided G$ Liquidity", time: "5 days ago" },
  ];

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view your GoodCred dashboard and credit
            score.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Score Card */}
        <div className="lg:col-span-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-3xl">Your GoodCred Score</CardTitle>
              <CardDescription>
                Your credit score determines your loan eligibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Score Gauge */}
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(score / 850) * 553} 553`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {scoreLoading ? (
                      <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
                    ) : (
                      <>
                        <div className="text-5xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                          {score}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          out of 850
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Score Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    {score > 0 && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Registered
                      </Badge>
                    )}
                    <Badge variant="secondary">Good Standing</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Score Range</span>
                      <span className="font-medium">
                        {score < 300
                          ? "Poor"
                          : score < 600
                          ? "Fair"
                          : score < 750
                          ? "Good"
                          : "Excellent"}
                      </span>
                    </div>
                    <Progress value={(score / 850) * 100} className="h-2" />
                    <div className="grid grid-cols-3 text-xs text-muted-foreground">
                      <span>Poor</span>
                      <span className="text-center">Fair</span>
                      <span className="text-right">Excellent</span>
                    </div>
                  </div>
                  {score === 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        You haven&apos;t registered yet. Register to start
                        building your credit score.
                      </p>
                      <Button
                        onClick={register}
                        disabled={registerLoading}
                        className="w-full"
                      >
                        {registerLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Registering...
                          </>
                        ) : (
                          "Register for GoodCred"
                        )}
                      </Button>
                    </div>
                  )}
                  {score > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Complete more quests to increase your score and unlock
                      better loan terms.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quests Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyan-500" />
              Quests Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-2xl font-bold">{completedQuests}</span>
                <span className="text-sm text-muted-foreground">
                  of {totalQuests}
                </span>
              </div>
              <Progress value={questProgress} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              Complete {totalQuests - completedQuests} more quests to reach your
              goal
            </p>
            <Button asChild className="w-full">
              <Link href="/quests">View All Quests</Link>
            </Button>
          </CardContent>
        </Card>

        {/* GoodID Verification */}
        <div className="lg:col-span-1">
          <GoodIDVerification
            environment="production"
            onVerificationComplete={(isVerified) => {
              if (isVerified) {
                // Invalidate and refetch credit score query
                queryClient.invalidateQueries({ queryKey: ["readContract"] });
              }
            }}
          />
        </div>

        {/* Loan Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Loan Status</CardTitle>
          </CardHeader>
          <CardContent>
            {hasLoan ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">
                      Amount Due
                    </div>
                    <div className="text-2xl font-bold">{loanAmount} G$</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">
                      Repayment Deadline
                    </div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {repaymentDeadline}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Button className="w-full">Repay Now</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">
                  You have no active loans
                </p>
                <Button asChild>
                  <Link href="/lending">Explore Loans</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
