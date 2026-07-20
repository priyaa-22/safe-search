import React, { useEffect } from "react";
import useCompliance from "../../hooks/useCompliance";
import PageHeader from "../../components/admin/PageHeader";
import { ContentCard, Badge, StatusBadge } from "../../components/ui";
import { Users, Key, Download, Search, ShieldCheck } from "lucide-react";
import { Spinner } from "../../components/Loader";

export default function AuditorActivityPage({ showToast }) {
  const { loading, auditorActivities, fetchAuditorActivity } = useCompliance(showToast);

  useEffect(() => {
    fetchAuditorActivity();
  }, [fetchAuditorActivity]);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <PageHeader
        title="External Auditor Activity Monitor"
        subtitle="Read-Only Oversight of External Auditor Actions, Key Version Rotations & Search Activity"
      />

      {loading ? (
        <div className="py-16 flex justify-center bg-white rounded-2xl border border-gray-200">
          <Spinner text="Loading Auditor Activities..." />
        </div>
      ) : (
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Auditor Action Log Stream</h3>
                <p className="text-xs text-gray-500">PEKS Searches, Key Rotations, and Credential PDF Exports</p>
              </div>
            </div>
            <Badge variant="emerald" className="font-mono text-xs">
              {auditorActivities.length} Actions Tracked
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Auditor Name</th>
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4">Activity Type</th>
                  <th className="py-3.5 px-4">Key Version</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditorActivities.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400 font-medium">
                      No auditor activities recorded.
                    </td>
                  </tr>
                ) : (
                  auditorActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                        {act.auditor}
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium whitespace-nowrap">
                        {act.organization}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap">
                        {act.activity}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                        v{act.key_version || 1}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">
                        {act.timestamp}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">
                        {act.ip_address}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <StatusBadge status={act.status === "SUCCESS" ? "Active" : "Disabled"} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
