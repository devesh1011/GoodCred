"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { refinedQuestFormSchema, type QuestFormData } from "@/lib/questFormSchema";
import { ZodError } from "zod";

interface QuestFormProps {
  onSubmit: (data: QuestFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<QuestFormData>;
  submitButtonText?: string;
}

export function QuestForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitButtonText = "Create Quest",
}: QuestFormProps) {
  const [questType, setQuestType] = useState<"ON_CHAIN" | "OFF_CHAIN">(
    (defaultValues?.questType as "ON_CHAIN" | "OFF_CHAIN") || "ON_CHAIN"
  );

  const [formData, setFormData] = useState<QuestFormData>({
    description: defaultValues?.description || "",
    targetPoints: defaultValues?.targetPoints || 50,
    questType,
    targetContract: (defaultValues?.targetContract as `0x${string}`) || "",
    reclaimProvider: defaultValues?.reclaimProvider || "",
    reclaimDataKey: defaultValues?.reclaimDataKey || "",
    reclaimVerificationUrl: (defaultValues?.reclaimVerificationUrl as string) || "",
    isActive: defaultValues?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestTypeChange = (type: "ON_CHAIN" | "OFF_CHAIN") => {
    setQuestType(type);
    setFormData((prev) => ({ ...prev, questType: type }));
    setErrors({});
  };

  const validateForm = (): boolean => {
    try {
      refinedQuestFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      const newErrors: Record<string, string> = {};
      if (err instanceof ZodError) {
        err.errors.forEach((error) => {
          const path = (error.path[0] as string) || "form";
          newErrors[path] = error.message;
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (err) {
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || isLoading;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quest Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Describe what users need to do to complete this quest"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          disabled={isFormDisabled}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Target Points */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Points (1-500) *
        </label>
        <input
          type="number"
          value={formData.targetPoints}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              targetPoints: parseInt(e.target.value, 10),
            }))
          }
          min="1"
          max="500"
          placeholder="50"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isFormDisabled}
        />
        {errors.targetPoints && (
          <p className="mt-1 text-sm text-red-600">{errors.targetPoints}</p>
        )}
      </div>

      {/* Quest Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quest Type *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="ON_CHAIN"
              checked={questType === "ON_CHAIN"}
              onChange={() => handleQuestTypeChange("ON_CHAIN")}
              className="w-4 h-4 text-blue-600"
              disabled={isFormDisabled}
            />
            <span className="ml-2 text-sm text-gray-700">On-Chain</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="OFF_CHAIN"
              checked={questType === "OFF_CHAIN"}
              onChange={() => handleQuestTypeChange("OFF_CHAIN")}
              className="w-4 h-4 text-blue-600"
              disabled={isFormDisabled}
            />
            <span className="ml-2 text-sm text-gray-700">Off-Chain</span>
          </label>
        </div>
      </div>

      {/* Conditional: ON-CHAIN */}
      {questType === "ON_CHAIN" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Contract Address *
          </label>
          <input
            type="text"
            value={formData.targetContract}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                targetContract: e.target.value as `0x${string}`,
              }))
            }
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            disabled={isFormDisabled}
          />
          {errors.targetContract && (
            <p className="mt-1 text-sm text-red-600">{errors.targetContract}</p>
          )}
        </div>
      )}

      {/* Conditional: OFF-CHAIN */}
      {questType === "OFF_CHAIN" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reclaim Provider (e.g., twitter, linkedin) *
            </label>
            <input
              type="text"
              value={formData.reclaimProvider}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  reclaimProvider: e.target.value,
                }))
              }
              placeholder="twitter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isFormDisabled}
            />
            {errors.reclaimProvider && (
              <p className="mt-1 text-sm text-red-600">{errors.reclaimProvider}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Key (e.g., email, username) *
            </label>
            <input
              type="text"
              value={formData.reclaimDataKey}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  reclaimDataKey: e.target.value,
                }))
              }
              placeholder="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isFormDisabled}
            />
            {errors.reclaimDataKey && (
              <p className="mt-1 text-sm text-red-600">{errors.reclaimDataKey}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification URL (optional)
            </label>
            <input
              type="text"
              value={formData.reclaimVerificationUrl}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  reclaimVerificationUrl: e.target.value as string,
                }))
              }
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isFormDisabled}
            />
            {errors.reclaimVerificationUrl && (
              <p className="mt-1 text-sm text-red-600">
                {errors.reclaimVerificationUrl}
              </p>
            )}
          </div>
        </>
      )}

      {/* Active Status */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            className="w-4 h-4 text-blue-600 rounded"
            disabled={isFormDisabled}
          />
          <span className="ml-2 text-sm text-gray-700">Active</span>
        </label>
      </div>

      {/* Error Message */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            Please fix the errors above before submitting.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isFormDisabled}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {isFormDisabled && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitButtonText}
      </button>
    </form>
  );
}
