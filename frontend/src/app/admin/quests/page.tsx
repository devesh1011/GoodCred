"use client";

import { useState } from "react";
import { Plus, Eye } from "lucide-react";
import { QuestForm } from "@/components/admin/QuestForm";
import { useAdminQuests } from "@/hooks/useAdminQuests";
import { type QuestFormData } from "@/lib/questFormSchema";

export default function AdminQuestsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { createQuest, isLoading } = useAdminQuests();

  const handleCreateQuest = async (data: QuestFormData) => {
    const result = await createQuest(data);
    if (result) {
      setShowCreateForm(false);
      console.log("Quest created, you may want to refresh the page");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Quests</h1>
          <p className="text-gray-600 mt-2">Create and manage all available quests</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Create Quest
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">New Quest</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <QuestForm
            onSubmit={handleCreateQuest}
            isLoading={isLoading}
            submitButtonText="Create Quest"
          />
        </div>
      )}

      {/* Quests List - Coming Soon */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
          <Eye className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Quest List Coming Soon
        </h3>
        <p className="text-gray-600">
          Once you create quests, they will appear here in a sortable, filterable table.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          In the meantime, you can create quests using the form above.
        </p>
      </div>

      {/* Placeholder for Future Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 opacity-50">
          <h3 className="font-semibold text-gray-700">Search</h3>
          <p className="text-sm text-gray-600 mt-2">Find quests by description</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 opacity-50">
          <h3 className="font-semibold text-gray-700">Filter</h3>
          <p className="text-sm text-gray-600 mt-2">By type, status, or points</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 opacity-50">
          <h3 className="font-semibold text-gray-700">Bulk Actions</h3>
          <p className="text-sm text-gray-600 mt-2">Manage multiple quests</p>
        </div>
      </div>
    </div>
  );
}
