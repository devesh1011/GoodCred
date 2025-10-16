import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";

// Reclaim Protocol Configuration
// TODO: Replace with your actual credentials from https://dev.reclaimprotocol.org
export const RECLAIM_APP_ID =
  process.env.NEXT_PUBLIC_RECLAIM_APP_ID || "YOUR_APPLICATION_ID";
export const RECLAIM_APP_SECRET =
  process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET || "YOUR_APPLICATION_SECRET";

// Provider IDs for different quest types
// You can get these from https://dev.reclaimprotocol.org/explore
export const RECLAIM_PROVIDERS = {
  GITHUB:
    process.env.NEXT_PUBLIC_RECLAIM_GITHUB_PROVIDER ||
    "YOUR_GITHUB_PROVIDER_ID",
  TWITTER:
    process.env.NEXT_PUBLIC_RECLAIM_TWITTER_PROVIDER ||
    "YOUR_TWITTER_PROVIDER_ID",
  LINKEDIN:
    process.env.NEXT_PUBLIC_RECLAIM_LINKEDIN_PROVIDER ||
    "YOUR_LINKEDIN_PROVIDER_ID",
  // Add more providers as needed
};

export interface ReclaimProof {
  identifier: string;
  claimData: {
    provider: string;
    parameters: string;
    context: string;
  };
  signatures: string[];
  witnesses: Array<{
    id: string;
    url: string;
  }>;
}

/**
 * Initialize a Reclaim proof request for a specific provider
 * @param providerId - The provider ID from Reclaim dev tool
 * @param context - Additional context to embed in the proof (e.g., user address, quest ID)
 */
export async function initializeReclaimRequest(
  providerId: string,
  context?: Record<string, string>
) {
  try {
    // Initialize the Reclaim SDK with your credentials
    const reclaimProofRequest = await ReclaimProofRequest.init(
      RECLAIM_APP_ID,
      RECLAIM_APP_SECRET,
      providerId
    );

    // Add context if provided
    if (context) {
      // Context will be available in the proof for verification
      const contextString = JSON.stringify(context);
      reclaimProofRequest.setAppCallbackUrl(
        `${
          window.location.origin
        }/api/reclaim/callback?context=${encodeURIComponent(contextString)}`
      );
    }

    return reclaimProofRequest;
  } catch (error) {
    console.error("Error initializing Reclaim request:", error);
    throw error;
  }
}

/**
 * Start the Reclaim verification flow
 * @param reclaimProofRequest - The initialized proof request
 * @param onSuccess - Callback when proof is generated successfully
 * @param onError - Callback when verification fails
 */
export async function startReclaimVerification(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reclaimProofRequest: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (proofs: any) => void,
  onError: (error: Error) => void
) {
  try {
    // Trigger the Reclaim flow (auto-detects desktop/mobile)
    await reclaimProofRequest.triggerReclaimFlow();

    // Start listening for proof submissions
    await reclaimProofRequest.startSession({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSuccess: (proofs: any) => {
        console.log("Verification successful:", proofs);
        onSuccess(proofs);
      },
      onError: (error: Error) => {
        console.error("Verification failed:", error);
        onError(error);
      },
    });
  } catch (error) {
    console.error("Error starting verification:", error);
    throw error;
  }
}

/**
 * Convert Reclaim proof to bytes format for smart contract submission
 * @param proof - The proof object from Reclaim
 */
export function serializeProofForContract(proof: ReclaimProof): string {
  // This function will serialize the proof into a format that can be submitted to your smart contract
  // The exact format depends on your contract's requirements

  // For now, we'll return the proof as a JSON string
  // You'll need to adjust this based on your contract's expected input format
  return JSON.stringify(proof);
}

/**
 * Extract context data from a Reclaim proof
 * @param proof - The proof object
 * @param field - The field to extract (e.g., 'userAddress', 'questId')
 */
export function extractContextField(
  proof: ReclaimProof,
  field: string
): string | null {
  try {
    const context = JSON.parse(proof.claimData.context);
    return context[field] || null;
  } catch (error) {
    console.error("Error extracting context field:", error);
    return null;
  }
}
