import React, { useEffect } from "react";
import useCompliance from "../../hooks/useCompliance";
import ComplianceFilters from "../../components/compliance/ComplianceFilters";
import AuditLogsTable from "../../components/compliance/AuditLogsTable";
import AuditLogDrawer from "../../components/compliance/AuditLogDrawer";
import PageHeader from "../../components/admin/PageHeader";
import { Spinner } from "../../components/Loader";

export default function AuditLogsPage({ showToast }) {
  const {
    loading,
    auditLogs,
    logMeta,
    selectedLog,
    drawerOpen,
    filters,
    updateFilters,
    openLogDrawer,
    closeLogDrawer,
    fetchAuditLogs,
    exportLogs,
  } = useCompliance(showToast);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleResetFilters = () => {
    updateFilters({
      severity: "ALL",
      status: "ALL",
      event: "ALL",
      user: "",
      organization: "",
      search: "",
      start_date: "",
      end_date: "",
      page: 1,
    });
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <PageHeader
        title="Audit Log Monitoring Workspace"
        subtitle="Complete Cryptographic Audit Trails, System Event Logs & Severity Tracking"
      />

      <ComplianceFilters
        filters={filters}
        onChange={updateFilters}
        onReset={handleResetFilters}
        onExport={exportLogs}
        totalCount={logMeta.total_count}
      />

      {loading ? (
        <div className="py-16 flex justify-center bg-white rounded-2xl border border-gray-200/80">
          <Spinner text="Fetching Audit Logs..." />
        </div>
      ) : (
        <AuditLogsTable
          logs={auditLogs}
          onRowClick={openLogDrawer}
          meta={logMeta}
          onPageChange={(page) => updateFilters({ page })}
        />
      )}

      <AuditLogDrawer isOpen={drawerOpen} onClose={closeLogDrawer} log={selectedLog} />
    </div>
  );
}
