import React, { useEffect } from "react";
import useCompliance from "../../hooks/useCompliance";
import OverviewCards from "../../components/compliance/OverviewCards";
import ComplianceCharts from "../../components/compliance/ComplianceCharts";
import AuditLogsTable from "../../components/compliance/AuditLogsTable";
import AuditLogDrawer from "../../components/compliance/AuditLogDrawer";
import PageHeader from "../../components/admin/PageHeader";
import { Button } from "../../components/ui";
import { Download, ShieldCheck, Activity, Users } from "lucide-react";
import { Spinner } from "../../components/Loader";

export default function ComplianceDashboard({ navigate, showToast }) {
  const {
    loading,
    dashboardLoading,
    metricsLoading,
    dashboardData,
    metricsData,
    selectedLog,
    drawerOpen,
    openLogDrawer,
    closeLogDrawer,
    fetchDashboard,
    fetchMetrics,
    exportLogs,
  } = useCompliance(showToast);

  useEffect(() => {
    fetchDashboard();
    fetchMetrics();
  }, [fetchDashboard, fetchMetrics]);

  if ((loading || dashboardLoading) && !dashboardData) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner text="Loading Compliance & Observability Data..." />
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const recentLogs = dashboardData?.recent_audit_logs || [];
  const recentSecurity = dashboardData?.recent_security_events || [];
  const recentAuditor = dashboardData?.recent_auditor_activity || [];

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Compliance & Security Governance"
          subtitle="Read-Only Monitoring, Audit Governance, Security Analytics & System Observability"
        />

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => exportLogs("csv")}
            className="text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button
            variant="primary"
            onClick={() => exportLogs("pdf")}
            className="text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </Button>
        </div>
      </div>

      {/* 8 Overview Cards */}
      <OverviewCards metrics={metrics} />

      {/* 10 Interactive Enterprise Charts */}
      <ComplianceCharts metrics={metricsData || {}} loading={metricsLoading && !metricsData} />

      {/* Recent Activity Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Security Events */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-rose-600" />
            Recent Security Events
          </h3>
          <p className="text-xs text-gray-500 mb-4">Latest unauthorized attempts & verification warnings</p>

          <div className="space-y-3">
            {recentSecurity.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No security incidents recorded.</p>
            ) : (
              recentSecurity.map((ev, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="font-semibold text-gray-900 block">{ev.action}</span>
                    <span className="text-[11px] text-gray-400 font-mono">{ev.timestamp} • User: {ev.user}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    ev.severity === "CRITICAL" ? "bg-rose-100 text-rose-700" : ev.severity === "HIGH" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {ev.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Auditor Activity */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-emerald-600" />
            Recent Auditor Activity
          </h3>
          <p className="text-xs text-gray-500 mb-4">Auditor key rotations, searches & credential downloads</p>

          <div className="space-y-3">
            {recentAuditor.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No auditor activities recorded.</p>
            ) : (
              recentAuditor.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="font-semibold text-gray-900 block">{act.auditor}</span>
                    <span className="text-[11px] text-gray-400">{act.organization} • {act.activity}</span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-500">{act.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Audit Logs Table Section */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent Audit Logs</h3>
            <p className="text-xs text-gray-500">Click any row to inspect complete cryptographic details</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate && navigate("/compliance/audit-logs")}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            View All Audit Logs →
          </Button>
        </div>

        <AuditLogsTable logs={recentLogs} onRowClick={openLogDrawer} />
      </div>

      {/* Drawer */}
      <AuditLogDrawer isOpen={drawerOpen} onClose={closeLogDrawer} log={selectedLog} />
    </div>
  );
}
