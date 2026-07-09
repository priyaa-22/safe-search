import React from "react";
import { AlertTriangle } from "lucide-react";

export default function DisableIdentityDialog({ isOpen, onClose, onConfirm, identity }) {
  if (!isOpen || !identity) return null;

  const isCurrentlyActive = identity.status === "Active";
  const actionText = isCurrentlyActive ? "Disable" : "Enable";
  const newStatus = isCurrentlyActive ? "Disabled" : "Active";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs font-sans px-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Content */}
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-6 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border ${
            isCurrentlyActive 
              ? "bg-rose-50 border-rose-100 text-rose-600" 
              : "bg-emerald-50 border-emerald-100 text-emerald-600"
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-lg font-bold text-gray-900 leading-snug">
              {actionText} User Identity?
            </h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to {actionText.toLowerCase()} access for{" "}
              <span className="font-semibold text-gray-800">{identity.fullName}</span> (
              <span className="font-mono text-xs">{identity.username}</span>)?
            </p>
            {isCurrentlyActive && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl mt-3 font-medium">
                🔒 Access will be immediately revoked. The user won't be able to log in until re-enabled.
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 mt-6 border-t border-gray-100 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(identity.id, newStatus)}
            className={`px-4 py-2 text-white font-semibold rounded-xl text-sm transition cursor-pointer ${
              isCurrentlyActive 
                ? "bg-rose-600 hover:bg-rose-700" 
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
