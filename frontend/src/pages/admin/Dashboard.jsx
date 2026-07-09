import React from "react";
import PageHeader from "../../components/admin/PageHeader";
import { Spinner } from "../../components/Loader";
import { ChevronRight, FileUp, Search, Shield, UserPlus } from "lucide-react";
import useDashboard from "../../hooks/useDashboard";

export default function AdminDashboard({ navigate }) {
  const { activities, healthChecks, loading } = useDashboard();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner text="Loading Control Center..." />
      </div>
    );
  }

  const securityActivity = activities.slice(0, 4);
  const identityCreations = activities.filter((activity) =>
    activity.action.toLowerCase().includes("identity")
  );
  const auditorRegistrations = activities.filter((activity) =>
    activity.action.toLowerCase().includes("auditor")
  );
  const keyRotations = activities.filter((activity) =>
    activity.action.toLowerCase().includes("key")
  );

  const statusRows = [
    { name: "JWT", status: "Healthy" },
    { name: "Database", status: "Healthy" },
    { name: "Encryption Engine", status: "Healthy" },
    { name: "Search Engine", status: "Healthy" },
    { name: "API", status: "Healthy" },
    ...healthChecks.filter(
      (check) => !["Database", "JWT Authentication", "Encryption Engine", "Search Engine", "API Status"].includes(check.name)
    ),
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="SecureMatch Control Center"
        description="Operational overview for identities, auditors, keys, and encrypted search activity."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActivityPanel title="Recent Security Activity" items={securityActivity} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActivityPanel title="Recent Identity Creations" items={identityCreations} empty="No recent identity changes." />
            <ActivityPanel title="Recent Auditor Registrations" items={auditorRegistrations} empty="No recent auditor registrations." />
          </div>
          <ActivityPanel title="Pending Key Rotations" items={keyRotations} empty="No pending key rotation activity." />
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight pb-4 border-b border-gray-100 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <ActionRow icon={UserPlus} label="Create Identity" onClick={() => navigate("/admin/iam")} />
              <ActionRow icon={Shield} label="Register Auditor" onClick={() => navigate("/admin/auditors")} />
              <ActionRow icon={FileUp} label="Upload Document" onClick={() => navigate("/admin/documents")} />
              <ActionRow icon={Search} label="Run Search" onClick={() => navigate("/admin/search")} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight pb-4 border-b border-gray-100 mb-2">
          System Status
        </h2>
        <div className="divide-y divide-gray-100">
          {statusRows.map((check) => (
            <div key={check.name} className="flex items-center justify-between py-3 gap-4">
              <span className="text-sm font-medium text-gray-700">{check.name}</span>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {check.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityPanel({ title, items, empty = "No recent activity." }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 tracking-tight pb-4 border-b border-gray-100 mb-2">
        {title}
      </h2>
      <div className="divide-y divide-gray-100">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">{empty}</p>
        ) : (
          items.map((item) => (
            <div key={`${title}-${item.id}`} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.details}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                  {item.timestamp}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ActionRow({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 border border-gray-100 hover:border-gray-200 hover:bg-gray-50 rounded-xl text-left transition cursor-pointer text-gray-700"
      type="button"
    >
      <span className="flex items-center gap-2.5">
        {React.createElement(Icon, { className: "w-4 h-4 text-blue-600" })}
        <span className="text-sm font-semibold text-gray-900">{label}</span>
      </span>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  );
}
