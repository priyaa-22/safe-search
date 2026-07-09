import React from "react";
import { Trash2, AlertOctagon } from "lucide-react";

export default function DeleteIdentityDialog({ isOpen, onClose, onConfirm, identity }) {
  if (!isOpen || !identity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs font-sans px-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Content */}
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-6 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-lg font-bold text-gray-900 leading-snug">
              Permanent Identity Deletion
            </h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-gray-800">{identity.fullName}</span> (
              <span className="font-mono text-xs">{identity.username}</span>)?
            </p>
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2.5 rounded-xl mt-3 font-medium">
              ⚠️ Warning: This action is destructive and cannot be undone. All audit histories tied to this username will lose access associations.
            </p>
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
            onClick={() => onConfirm(identity.id)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Delete Identity
          </button>
        </div>
      </div>
    </div>
  );
}
