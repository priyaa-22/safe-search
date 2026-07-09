import React from "react";
import IdentityRow from "./IdentityRow";

export default function IdentityTable({
  identities,
  onView,
  onEdit,
  onToggleDisable,
  onDelete,
}) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-400 font-medium font-mono text-[10px] tracking-wider uppercase">
              <th className="py-3.5 pl-4">Identity</th>
              <th className="py-3.5">Username</th>
              <th className="py-3.5">Assigned Role</th>
              <th className="py-3.5">Status</th>
              <th className="py-3.5">Last Login</th>
              <th className="py-3.5">Created</th>
              <th className="py-3.5 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150">
            {identities.map((identity) => (
              <IdentityRow
                key={identity.id}
                identity={identity}
                onView={onView}
                onEdit={onEdit}
                onToggleDisable={onToggleDisable}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
