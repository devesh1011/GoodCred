"use client";

import { OwnerGuard } from "@/components/admin/OwnerGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OwnerGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
      </div>
    </OwnerGuard>
  );
}
