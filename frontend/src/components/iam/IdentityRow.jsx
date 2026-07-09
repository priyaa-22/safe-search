import React from "react";
import { Eye, Edit2, Ban, Trash2 } from "lucide-react";

export default function IdentityRow({ identity, onView, onEdit, onToggleDisable, onDelete }) {
  const getInitials = (name) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Administrator":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "Internal Analyst":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "Compliance Officer":
        return "bg-indigo-50 border-indigo-200 text-indigo-700";
      case "External Auditor":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "Read Only Analyst":
        return "bg-slate-50 border-slate-200 text-slate-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "Disabled":
        return "bg-rose-50 border-rose-200 text-rose-700";
      case "Locked":
        return "bg-amber-50 border-amber-200 text-amber-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <tr className="hover:bg-slate-50/50 transition border-b border-gray-100/60 font-sans">
      {/* Identity (Full Name & Avatar) */}
      <td className="py-4 pl-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm shadow-xs font-mono select-none">
            {getInitials(identity.fullName)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {identity.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-xs">
              {identity.email || "No email registered"}
            </p>
          </div>
        </div>
      </td>

      {/* Username */}
      <td className="py-4 font-mono text-xs text-gray-700">
        {identity.username}
      </td>

      {/* Assigned Role */}
      <td className="py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getRoleBadgeColor(identity.role)}`}>
          {identity.role}
        </span>
        {identity.role === "External Auditor" && identity.organization && (
          <p className="text-[10px] text-gray-400 font-medium mt-1">
            {identity.organization}
          </p>
        )}
      </td>

      {/* Status */}
      <td className="py-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${getStatusBadgeColor(identity.status)}`}>
          {identity.status}
        </span>
      </td>

      {/* Last Login */}
      <td className="py-4 text-xs text-gray-500">
        {identity.lastLogin}
      </td>

      {/* Created */}
      <td className="py-4 text-xs text-gray-500 font-mono">
        {identity.created}
      </td>

      {/* Actions */}
      <td className="py-4 pr-4">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onView(identity)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {identity.role !== "Administrator" && (
            <>
              <button
                onClick={() => onEdit(identity)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
                title="Edit Identity"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onToggleDisable(identity)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  identity.status === "Active"
                    ? "text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}
                title={identity.status === "Active" ? "Disable Identity" : "Enable Identity"}
              >
                <Ban className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(identity)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Delete Identity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
