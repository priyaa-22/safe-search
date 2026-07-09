import React from "react";
import { UserX } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-200 border-dashed rounded-2xl font-sans">
      <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 mb-4">
        <UserX className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">No identities found</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">
        Create your first identity to begin managing SecureMatch access.
      </p>
    </div>
  );
}
