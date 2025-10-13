"use client";

import { useAccount, useWalletClient } from "wagmi";
import { useState, useCallback, useEffect } from "react";
import { IdentitySDK } from "@goodsdks/citizen-sdk";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";

type Environment = "production" | "staging" | "development";

interface FVLinkOptions {
  firstName?: string;
  callbackUrl?: string;
  popupMode?: boolean;
  chainId?: number;
}

interface FVResult {
  isVerified: boolean;
  reason?: string;
}

export function useGoodID(environment: Environment = "production") {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [identitySDK, setIdentitySDK] = useState<IdentitySDK | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize SDK when wallet client is available
  useEffect(() => {
    const initSDK = async () => {
      if (!walletClient || !address) {
        setIdentitySDK(null);
        return;
      }

      try {
        // Create a dedicated public client for Celo mainnet
        // GoodID SDK only works with Celo mainnet, not testnets
        const celoPublicClient = createPublicClient({
          chain: celo,
          transport: http(),
        });

        const sdk = await IdentitySDK.init({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          publicClient: celoPublicClient as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          walletClient: walletClient as any,
          env: environment,
        });
        setIdentitySDK(sdk);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize IdentitySDK:", err);
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to initialize identity SDK";
        setError(errorMsg);
        setIdentitySDK(null);
      }
    };

    initSDK();
  }, [walletClient, address, environment]);

  // Check if an address is verified
  const isAddressVerified = useCallback(
    async (checkAddress?: `0x${string}`) => {
      if (!identitySDK) {
        console.warn("Identity SDK not initialized");
        return false;
      }

      const targetAddress = checkAddress || address;
      if (!targetAddress) return false;

      try {
        const { isWhitelisted } = await identitySDK.getWhitelistedRoot(
          targetAddress
        );
        return isWhitelisted;
      } catch (err) {
        console.error("Error checking verification status:", err);
        return false;
      }
    },
    [identitySDK, address]
  );

  // Generate Face Verification link
  const generateFVLink = useCallback(
    async (options: FVLinkOptions): Promise<string> => {
      if (!identitySDK) {
        throw new Error("Identity SDK not initialized");
      }

      setIsLoading(true);
      setError(null);

      try {
        const {
          popupMode = false,
          callbackUrl,
          chainId: targetChainId,
        } = options;

        // Use SDK to generate FV link
        const fvLink = await identitySDK.generateFVLink(
          popupMode,
          callbackUrl,
          targetChainId
        );

        setIsLoading(false);
        return fvLink;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate FV link";
        setError(errorMessage);
        setIsLoading(false);
        throw new Error(errorMessage);
      }
    },
    [identitySDK]
  );

  // Open Face Verification in popup
  const openFVPopup = useCallback(
    async (options: Omit<FVLinkOptions, "popupMode">) => {
      const link = await generateFVLink({ ...options, popupMode: true });
      const popup = window.open(
        link,
        "goodid-verification",
        "width=480,height=720,scrollbars=yes"
      );

      return new Promise<FVResult>((resolve, reject) => {
        // Poll for popup closure
        const pollTimer = setInterval(() => {
          if (popup?.closed) {
            clearInterval(pollTimer);
            // Check verification status after popup closes
            isAddressVerified().then((verified) => {
              resolve({ isVerified: verified });
            });
          }
        }, 1000);

        // Timeout after 10 minutes
        setTimeout(() => {
          clearInterval(pollTimer);
          reject(new Error("Face verification timeout"));
        }, 600000);
      });
    },
    [generateFVLink, isAddressVerified]
  );

  // Redirect to Face Verification
  const redirectToFV = useCallback(
    async (options: Omit<FVLinkOptions, "popupMode" | "callbackUrl">) => {
      const callbackUrl = window.location.href;
      const link = await generateFVLink({
        ...options,
        popupMode: false,
        callbackUrl,
      });
      window.location.href = link;
    },
    [generateFVLink]
  );

  return {
    isAddressVerified,
    generateFVLink,
    openFVPopup,
    redirectToFV,
    isLoading: isLoading || !identitySDK,
    error,
  };
}
