import React from "react";
import { Badge, StatusBadge, Button } from "../ui";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

export default function AuditLogsTable({
  logs = [],
  onRowClick,
  meta = { page: 1, total_pages: 1, total_count: 0 },
  onPageChange,
}) {
  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return <Badge variant="rose" className="font-mono text-[10px]">CRITICAL</Badge>;
      case "HIGH":
        return <Badge variant="amber" className="font-mono text-[10px]">HIGH</Badge>;
      case "MEDIUM":
        return <Badge variant="warning" className="font-mono text-[10px]">MEDIUM</Badge>;
      case "LOW":
        return <Badge variant="blue" className="font-mono text-[10px]">LOW</Badge>;
      default:
        return <Badge variant="gray" className="font-mono text-[10px]">INFO</Badge>;
    }
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">Event</th>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Organization</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Severity</th>
              <th className="py-3.5 px-4">IP Address</th>
              <th className="py-3.5 px-4">Key Version</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-gray-400 font-medium">
                  No audit log entries match the selected filters.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => onRowClick(log)}
                  className="hover:bg-gray-50/80 transition cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                    {log.event || log.action}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">
                    {log.user || log.username || "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-600 truncate max-w-[160px]">
                    {log.organization || "Internal Org"}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge
                      status={log.status === "SUCCESS" ? "Active" : log.status === "DENIED" ? "Locked" : "Disabled"}
                    />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getSeverityBadge(log.severity)}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">
                    {log.ip_address || "127.0.0.1"}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap text-center">
                    v{log.key_version || 1}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(log);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition cursor-pointer"
                      title="Inspect details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {meta && meta.total_pages > 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200/80 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Page <span className="font-semibold text-gray-800">{meta.page}</span> of{" "}
            <span className="font-semibold text-gray-800">{meta.total_pages}</span> ({meta.total_count} items)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              disabled={meta.page <= 1}
              onClick={() => onPageChange(meta.page - 1)}
              className="text-xs py-1 px-2.5 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </Button>
            <Button
              variant="secondary"
              disabled={meta.page >= meta.total_pages}
              onClick={() => onPageChange(meta.page + 1)}
              className="text-xs py-1 px-2.5 flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
