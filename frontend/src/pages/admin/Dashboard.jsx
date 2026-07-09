import React from "react";
import PageHeader from "../../components/admin/PageHeader";
import StatCard from "../../components/admin/StatCard";
import { Spinner } from "../../components/Loader";
import {
  Users,
  Shield,
  FileLock,
  Search,
  ShieldAlert,
  Activity,
  Clock,
  KeyRound,
  ChevronRight,
  UserPlus,
  FileUp,
  BarChart3,
} from "lucide-react";
import useDashboard from "../../hooks/useDashboard";

export default function AdminDashboard({ navigate }) {
  const { stats, activities, healthChecks, loading } = useDashboard();

  // Maps icons based on type
  const getIconForActivity = (type) => {
    switch (type) {
      case "auditor_created":
        return Shield;
      case "identity_disabled":
        return ShieldAlert;
      case "document_uploaded":
        return FileLock;
      case "search_executed":
        return Search;
      case "key_rotated":
        return KeyRound;
      default:
        return Users;
    }
  };

  const getIconColorForActivity = (type) => {
    switch (type) {
      case "auditor_created":
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "identity_disabled":
        return "text-rose-600 bg-rose-50 border-rose-100";
      case "document_uploaded":
        return "text-blue-600 bg-blue-50 border-blue-100";
      case "search_executed":
        return "text-violet-600 bg-violet-50 border-violet-100";
      case "key_rotated":
        return "text-amber-600 bg-amber-50 border-amber-100";
      default:
        return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  const getIconForStat = (title) => {
    switch (title) {
      case "Managed Identities":
        return Users;
      case "External Auditors":
        return Shield;
      case "Encrypted Documents":
        return FileLock;
      case "Search Operations Today":
        return Search;
      case "Security Events":
        return ShieldAlert;
      default:
        return Activity;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner text="Loading Control Center..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="SecureMatch Control Center"
        description="Enterprise Security Administration Console"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={getIconForStat(stat.title)}
            trend={stat.trend}
            trendType={stat.trendType}
            description={stat.description}
          />
        ))}
      </div>

      {/* Columns: Recent Activity & stacks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Security Activity */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-gray-100 mb-6">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Security Activity</h2>
              <p className="text-xs text-gray-555 mt-1">Real-time audit log of system IAM operations and cryptographic processes.</p>
            </div>

            <div className="relative border-l border-gray-150 pl-6 ml-3 space-y-6">
              {activities.map((act) => {
                const Icon = getIconForActivity(act.type);
                return (
                  <div key={act.id} className="relative">
                    {/* Activity Dot Icon */}
                    <div className={`absolute -left-9.5 top-0 w-7 h-7 rounded-lg border flex items-center justify-center shadow-xs ${getIconColorForActivity(act.type)}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-900">{act.action}</p>
                        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {act.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{act.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stack: Quick Actions & Health */}
        <div className="space-y-6 flex flex-col">
          {/* Quick Actions Panel */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 tracking-tight pb-3 border-b border-gray-100 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/admin/iam")}
                className="w-full flex items-center justify-between p-3 border border-gray-100 hover:border-gray-200 hover:bg-slate-50/50 rounded-xl text-left transition cursor-pointer text-gray-700"
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-950">Create Identity</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => navigate("/admin/auditors")}
                className="w-full flex items-center justify-between p-3 border border-gray-100 hover:border-gray-200 hover:bg-slate-50/50 rounded-xl text-left transition cursor-pointer text-gray-700"
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-950">Register Auditor</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => navigate("/admin/documents")}
                className="w-full flex items-center justify-between p-3 border border-gray-100 hover:border-gray-200 hover:bg-slate-50/50 rounded-xl text-left transition cursor-pointer text-gray-700"
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
                    <FileUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-950">Upload Document</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => navigate("/admin/metrics")}
                className="w-full flex items-center justify-between p-3 border border-gray-100 hover:border-gray-200 hover:bg-slate-50/50 rounded-xl text-left transition cursor-pointer text-gray-700"
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-950">View Analytics</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* System Health Panel */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex-grow">
            <h2 className="text-base font-bold text-gray-900 tracking-tight pb-3 border-b border-gray-100 mb-4">
              System Health
            </h2>
            <div className="space-y-3.5">
              {healthChecks.map((check, idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <span className="text-xs font-semibold text-gray-700">{check.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                      {check.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
