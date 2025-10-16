"use client";

import { useOwnerCheck } from "@/hooks/useOwnerCheck";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface OwnerGuardProps {
  children: React.ReactNode;
  fallbackRoute?: string;
}

/**
 * Component to protect admin pages - only renders children if wallet is contract owner
 * Shows appropriate UI for unauthorized or loading states
 */
export function OwnerGuard({ children, fallbackRoute = "/" }: OwnerGuardProps) {
  const { isOwner, isLoading, isConnected, connectedWallet, currentOwner } =
    useOwnerCheck();

  // Show loading state while checking ownership
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show error if wallet not connected
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full mx-4 p-6 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <h2 className="text-lg font-semibold text-amber-900">
              Wallet Not Connected
            </h2>
          </div>
          <p className="text-amber-800">
            Please connect your wallet to access the admin dashboard.
          </p>
          <Link
            href={fallbackRoute}
            className="inline-block w-full text-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Show error if wallet is not the owner
  if (!isOwner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full mx-4 p-6 bg-red-50 border border-red-200 rounded-lg space-y-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">
              Access Denied
            </h2>
          </div>
          <div className="space-y-2 text-red-800 text-sm">
            <p>You do not have permission to access the admin dashboard.</p>
            <p>
              <strong>Your wallet:</strong> {connectedWallet?.slice(0, 6)}...
              {connectedWallet?.slice(-4)}
            </p>
            <p>
              <strong>Owner wallet:</strong> {currentOwner?.slice(0, 6)}...
              {currentOwner?.slice(-4)}
            </p>
          </div>
          <Link
            href={fallbackRoute}
            className="inline-block w-full text-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Render protected content if user is owner
  return <>{children}</>;
}
