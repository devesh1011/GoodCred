import { z } from "zod";

export const questFormSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),

  targetPoints: z
    .number()
    .int("Points must be a whole number")
    .min(1, "Points must be at least 1")
    .max(500, "Points must not exceed 500"),

  questType: z.enum(["ON_CHAIN", "OFF_CHAIN"], {
    errorMap: () => ({ message: "Please select a quest type" }),
  }),

  // Conditional: ON_CHAIN quests
  targetContract: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .optional()
    .or(z.literal("")),

  // Conditional: OFF_CHAIN quests
  reclaimProvider: z
    .string()
    .min(1, "Provider is required for off-chain quests")
    .optional(),

  reclaimDataKey: z
    .string()
    .min(1, "Data key is required for off-chain quests")
    .optional(),

  reclaimVerificationUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),

  // Optional fields
  isActive: z.boolean().default(true),

  deadline: z.number().positive("Deadline must be in the future").optional(),
});

// Infer type from schema
export type QuestFormData = z.infer<typeof questFormSchema>;

// Refined schema with conditional validation
export const refinedQuestFormSchema = questFormSchema
  .refine(
    (data) => {
      // If ON_CHAIN, must have targetContract
      if (data.questType === "ON_CHAIN" && !data.targetContract) {
        return false;
      }
      return true;
    },
    {
      message: "Target contract is required for on-chain quests",
      path: ["targetContract"],
    }
  )
  .refine(
    (data) => {
      // If OFF_CHAIN, must have provider and dataKey
      if (data.questType === "OFF_CHAIN") {
        if (!data.reclaimProvider || !data.reclaimDataKey) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Provider and data key are required for off-chain quests",
      path: ["reclaimProvider"],
    }
  );

// Helper to get default values based on quest type
export function getDefaultQuestFormData(
  type: "ON_CHAIN" | "OFF_CHAIN"
): Partial<QuestFormData> {
  return {
    questType: type,
    isActive: true,
    targetPoints: 50,
    ...(type === "ON_CHAIN" && {
      targetContract: "",
    }),
    ...(type === "OFF_CHAIN" && {
      reclaimProvider: "",
      reclaimDataKey: "",
      reclaimVerificationUrl: "",
    }),
  };
}
