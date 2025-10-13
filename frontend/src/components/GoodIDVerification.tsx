"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useGoodID } from "@/hooks/useGoodID";
import { useGoodCredScore } from "@/hooks/useGoodCred";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  UserCheck,
  AlertCircle,
} from "lucide-react";

interface GoodIDVerificationProps {
  environment?: "production" | "staging" | "development";
  onVerificationComplete?: (isVerified: boolean) => void;
}

export default function GoodIDVerification({
  environment = "production",
  onVerificationComplete,
}: GoodIDVerificationProps) {
  const { address, isConnected } = useAccount();
  const {
    isAddressVerified,
    openFVPopup,
    isLoading: sdkLoading,
    error: sdkError,
  } = useGoodID(environment);

  const { verifyIdentity, verifyLoading } = useGoodCredScore();

  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check verification status on mount and when address changes
  useEffect(() => {
    const checkStatus = async () => {
      if (!address) return;

      setIsChecking(true);
      setError(null);

      try {
        const verified = await isAddressVerified();
        setIsVerified(verified);
        if (onVerificationComplete) {
          onVerificationComplete(verified);
        }
      } catch (err) {
        console.error("Error checking verification:", err);
        setError("Failed to check verification status");
      } finally {
        setIsChecking(false);
      }
    };

    if (address && isConnected) {
      checkStatus();
    }
  }, [address, isConnected, isAddressVerified, onVerificationComplete]);

  const checkVerificationStatus = async () => {
    if (!address) return;

    setIsChecking(true);
    setError(null);

    try {
      const verified = await isAddressVerified();
      setIsVerified(verified);
      if (onVerificationComplete) {
        onVerificationComplete(verified);
      }
    } catch (err) {
      console.error("Error checking verification:", err);
      setError("Failed to check verification status");
    } finally {
      setIsChecking(false);
    }
  };

  const handleVerify = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const result = await openFVPopup({
        firstName: "User", // You can make this customizable
        callbackUrl: window.location.href,
        chainId: 11142220, // Celo Sepolia testnet
      });

      if (result.isVerified) {
        setIsVerified(true);

        // Call smart contract to award +100 points
        try {
          await verifyIdentity();
          console.log(
            "Identity verified on smart contract, +100 points awarded"
          );
        } catch (contractError) {
          console.error("Failed to update smart contract:", contractError);
          setError(
            "Verification successful but failed to update credit score. Please try refreshing."
          );
        }

        if (onVerificationComplete) {
          onVerificationComplete(true);
        }
      } else {
        setError(result.reason || "Verification failed");
        setIsVerified(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Verification failed";
      setError(errorMessage);
      console.error("Verification error:", err);
    } finally {
      setVerifying(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            GoodID Verification
          </CardTitle>
          <CardDescription>
            Connect your wallet to verify your identity
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          GoodID Verification
        </CardTitle>
        <CardDescription>
          Verify your identity to earn +100 credit score points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Verification Status */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            {isChecking ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : isVerified === true ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : isVerified === false ? (
              <XCircle className="w-5 h-5 text-destructive" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <div>
              <p className="font-medium">
                {isChecking
                  ? "Checking status..."
                  : isVerified === true
                  ? "Identity Verified"
                  : isVerified === false
                  ? "Not Verified"
                  : "Verification Required"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isVerified === true
                  ? "Your identity has been verified"
                  : "Complete face verification to prove uniqueness"}
              </p>
            </div>
          </div>
          {isVerified === true && (
            <Badge variant="default" className="ml-2">
              +100 Points
            </Badge>
          )}
        </div>

        {/* Error Message */}
        {(error || sdkError) && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error || sdkError}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isVerified !== true && (
            <Button
              onClick={handleVerify}
              disabled={verifying || sdkLoading || isChecking || verifyLoading}
              className="flex-1"
            >
              {verifying || verifyLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {verifyLoading ? "Updating Score..." : "Verifying..."}
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Verify Identity
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={checkVerificationStatus}
            disabled={isChecking || sdkLoading}
          >
            {isChecking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Refresh Status"
            )}
          </Button>
        </div>

        {/* Information */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Face verification ensures one account per person</p>
          <p>• Your privacy is protected using zero-knowledge proofs</p>
          <p>• Verification uses Celo mainnet (your testnet funds are safe)</p>
          <p>• Verification is required to access loans</p>
        </div>
      </CardContent>
    </Card>
  );
}
