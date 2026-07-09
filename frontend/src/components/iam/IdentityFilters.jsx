import React from "react";

export default function IdentityFilters({
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  onReset,
}) {
  const roles = [
    "Internal Analyst",
    "Compliance Officer",
    "External Auditor",
    "Read Only Analyst",
  ];

  const statuses = ["Active", "Disabled", "Locked"];

  const hasActiveFilters = selectedRole !== "" || selectedStatus !== "";

  return (
    <div className="flex flex-wrap items-center gap-3 font-sans">
      {/* Role Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">Role</span>
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="border border-gray-200 bg-white rounded-xl px-3 py-2 text-xs font-semibold focus:border-black focus:outline-none text-gray-700 cursor-pointer shadow-xs transition hover:border-gray-300"
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">Status</span>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="border border-gray-200 bg-white rounded-xl px-3 py-2 text-xs font-semibold focus:border-black focus:outline-none text-gray-700 cursor-pointer shadow-xs transition hover:border-gray-300"
        >
          <option value="">All Statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="text-xs font-bold text-rose-600 hover:text-rose-800 transition px-3 py-2 rounded-xl hover:bg-rose-50 cursor-pointer"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
