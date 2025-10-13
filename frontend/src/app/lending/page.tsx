"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, TrendingUp, Users, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function LendingPage() {
  const [borrowAmount, setBorrowAmount] = useState("");
  const [lendAmount, setLendAmount] = useState("");

  // Mock data - replace with actual data from your backend/blockchain
  const userScore = 550;
  const minScoreRequired = 500;
  const isEligible = userScore >= minScoreRequired;
  const maxLoanAmount = isEligible ? Math.floor(userScore / 5.5) : 0; // Simple calculation
  const interestRate = 5; // 5%
  const loanFee = borrowAmount
    ? parseFloat(borrowAmount) * (interestRate / 100)
    : 0;
  const totalRepayment = borrowAmount ? parseFloat(borrowAmount) + loanFee : 0;

  // Lending pool stats
  const totalPoolSize = 50000;
  const totalBorrowed = 35000;
  const availableFunds = totalPoolSize - totalBorrowed;
  const poolUtilization = (totalBorrowed / totalPoolSize) * 100;
  const aprForLenders = 8.5; // 8.5% APR

  const handleBorrow = () => {
    // Implement borrowing logic
    console.log("Borrowing:", borrowAmount);
  };

  const handleLend = () => {
    // Implement lending logic
    console.log("Lending:", lendAmount);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Lending</h1>
          <p className="text-lg text-muted-foreground">
            Borrow G$ based on your credit score or lend to earn interest
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Borrowing Section */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Borrow G$</CardTitle>
                <CardDescription>
                  Get instant access to funds based on your credit score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Eligibility Status */}
                <div
                  className={`p-4 rounded-lg ${
                    isEligible
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-amber-500/10 border border-amber-500/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className={`w-5 h-5 mt-0.5 ${
                        isEligible ? "text-green-500" : "text-amber-500"
                      }`}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="font-semibold">
                        {isEligible
                          ? "You are eligible to borrow!"
                          : "Not eligible yet"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isEligible
                          ? `Your credit score of ${userScore} qualifies you for loans up to ${maxLoanAmount} G$`
                          : `You need a minimum score of ${minScoreRequired}. Your current score is ${userScore}.`}
                      </div>
                      {isEligible && (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Your Score
                            </div>
                            <div className="text-xl font-bold text-green-500">
                              {userScore}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Max Loan
                            </div>
                            <div className="text-xl font-bold text-cyan-500">
                              {maxLoanAmount} G$
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Loan Form */}
                {isEligible && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="borrow-amount">Loan Amount (G$)</Label>
                      <Input
                        id="borrow-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={borrowAmount}
                        onChange={(e) => setBorrowAmount(e.target.value)}
                        max={maxLoanAmount}
                        min={1}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum: {maxLoanAmount} G$
                      </p>
                    </div>

                    {borrowAmount && parseFloat(borrowAmount) > 0 && (
                      <div className="p-4 rounded-lg bg-muted space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Loan Amount
                          </span>
                          <span className="font-medium">{borrowAmount} G$</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Interest ({interestRate}%)
                          </span>
                          <span className="font-medium">
                            {loanFee.toFixed(2)} G$
                          </span>
                        </div>
                        <div className="border-t pt-3 flex justify-between">
                          <span className="font-semibold">Total Repayment</span>
                          <span className="font-bold text-lg">
                            {totalRepayment.toFixed(2)} G$
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={handleBorrow}
                      disabled={
                        !borrowAmount ||
                        parseFloat(borrowAmount) <= 0 ||
                        parseFloat(borrowAmount) > maxLoanAmount
                      }
                    >
                      Confirm Loan
                    </Button>
                  </div>
                )}

                {!isEligible && (
                  <div className="text-center py-4">
                    <Button variant="outline" asChild>
                      <a href="/quests">Complete Quests to Increase Score</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lending Section */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Support the Pool</CardTitle>
                <CardDescription>
                  Lend G$ to earn interest and help others access credit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pool Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-cyan-500" />
                      <span className="text-xs text-muted-foreground">
                        Total Pool
                      </span>
                    </div>
                    <div className="text-2xl font-bold">
                      {totalPoolSize.toLocaleString()} G$
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">APR</span>
                    </div>
                    <div className="text-2xl font-bold text-green-500">
                      {aprForLenders}%
                    </div>
                  </div>
                </div>

                {/* Pool Utilization */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Pool Utilization
                    </span>
                    <span className="font-medium">
                      {poolUtilization.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={poolUtilization} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Borrowed: {totalBorrowed.toLocaleString()} G$</span>
                    <span>Available: {availableFunds.toLocaleString()} G$</span>
                  </div>
                </div>

                {/* Lend Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lend-amount">Amount to Deposit (G$)</Label>
                    <Input
                      id="lend-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={lendAmount}
                      onChange={(e) => setLendAmount(e.target.value)}
                      min={1}
                    />
                  </div>

                  {lendAmount && parseFloat(lendAmount) > 0 && (
                    <div className="p-4 rounded-lg bg-muted space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Your Deposit
                        </span>
                        <span className="font-medium">{lendAmount} G$</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Est. Annual Interest
                        </span>
                        <span className="font-medium text-green-500">
                          {(
                            parseFloat(lendAmount) *
                            (aprForLenders / 100)
                          ).toFixed(2)}{" "}
                          G$
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={handleLend}
                    disabled={!lendAmount || parseFloat(lendAmount) <= 0}
                  >
                    Deposit to Pool
                  </Button>
                </div>

                {/* Info */}
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      Your deposits help others build their credit while earning
                      you passive income. Funds can be withdrawn at any time.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
