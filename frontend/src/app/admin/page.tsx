"use client";

import { useOwnerCheck } from "@/hooks/useOwnerCheck";
import { Settings, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { currentOwner, connectedWallet } = useOwnerCheck();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage quests, view statistics, and configure the platform
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Quests</p>
          <p className="text-2xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-500 mt-2">Loading...</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Active Quests</p>
          <p className="text-2xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-500 mt-2">Loading...</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Completions</p>
          <p className="text-2xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-500 mt-2">Coming soon</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Avg Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-500 mt-2">Coming soon</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/quests"
          className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Manage Quests</h3>
              <p className="text-sm text-gray-600 mt-1">
                Create, edit, and deactivate quests
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer opacity-50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Settings</h3>
              <p className="text-sm text-gray-600 mt-1">
                Configure platform settings
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Link>
      </div>

      {/* Admin Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Owner Address:</strong>{" "}
          {currentOwner
            ? `${currentOwner.slice(0, 6)}...${currentOwner.slice(-4)}`
            : "Loading..."}
        </p>
        <p className="text-sm text-blue-900 mt-2">
          <strong>Connected Wallet:</strong>{" "}
          {connectedWallet
            ? `${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}`
            : "Not connected"}
        </p>
      </div>
    </div>
  );
}
