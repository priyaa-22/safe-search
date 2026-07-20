import { useState, useEffect, useCallback } from "react";
import complianceService from "../services/complianceService";
import { handleApiError } from "../utils/errorHandler";

export function useCompliance(showToast) {
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [logMeta, setLogMeta] = useState({ page: 1, page_size: 15, total_count: 0, total_pages: 1 });
  const [auditorActivities, setAuditorActivities] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);

  // Selected Log for Drawer
  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    severity: "ALL",
    status: "ALL",
    event: "ALL",
    user: "",
    organization: "",
    search: "",
    start_date: "",
    end_date: "",
    page: 1,
    page_size: 15,
  });

  const fetchDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);
      setLoading(true);
      const res = await complianceService.getDashboard();
      if (res.status === "success" && res.data) {
        setDashboardData(res.data);
        if (res.data.recent_audit_logs) {
          setAuditLogs(res.data.recent_audit_logs);
        }
      }
    } catch (err) {
      console.error("Failed to load compliance dashboard", err);
      const { message } = handleApiError(err);
      if (showToast) showToast(message || "Failed to load compliance dashboard", "error");
    } finally {
      setDashboardLoading(false);
      setLoading(false);
    }
  }, [showToast]);

  const fetchAuditLogs = useCallback(async (customFilters = {}) => {
    try {
      setLoading(true);
      const activeFilters = { ...filters, ...customFilters };
      const res = await complianceService.getAuditLogs(activeFilters);
      if (res.status === "success" && res.data) {
        setAuditLogs(res.data.results || []);
        if (res.meta) {
          setLogMeta(res.meta);
        }
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
      const { message } = handleApiError(err);
      if (showToast) showToast(message || "Failed to load audit logs", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  const fetchAuditorActivity = useCallback(async () => {
    try {
      setLoading(true);
      const res = await complianceService.getAuditorActivity();
      if (res.status === "success" && res.data) {
        setAuditorActivities(res.data.activities || []);
      }
    } catch (err) {
      console.error("Failed to load auditor activity", err);
      const { message } = handleApiError(err);
      if (showToast) showToast(message || "Failed to load auditor activity", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      setLoading(true);
      const res = await complianceService.getMetrics();
      if (res.status === "success" && res.data) {
        setMetricsData(res.data);
      }
    } catch (err) {
      console.error("Failed to load metrics", err);
      const { message } = handleApiError(err);
      if (showToast) showToast(message || "Failed to load metrics", "error");
    } finally {
      setMetricsLoading(false);
      setLoading(false);
    }
  }, [showToast]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await complianceService.getReports();
      if (res.status === "success" && res.data) {
        setReportsData(res.data);
      }
    } catch (err) {
      console.error("Failed to load compliance reports", err);
      const { message } = handleApiError(err);
      if (showToast) showToast(message || "Failed to load compliance reports", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchSystemHealth = useCallback(async () => {
    try {
      const res = await complianceService.getSystemHealth();
      if (res.status === "success" && res.data) {
        setSystemHealth(res.data);
      }
    } catch (err) {
      console.error("Failed to load system health", err);
    }
  }, []);

  const exportLogs = async (format = "csv", scope = "filtered") => {
    try {
      if (showToast) showToast(`Preparing ${format.toUpperCase()} export...`, "info");
      const exportParams = { ...filters, format, scope };
      const response = await complianceService.exportLogs(exportParams);

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `SecureMatch_Audit_Logs.${format === "excel" ? "xlsx" : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      if (showToast) showToast(`Export downloaded successfully (${format.toUpperCase()})`, "success");
    } catch (err) {
      console.error("Failed to export audit logs", err);
      if (showToast) showToast("Failed to export audit logs", "error");
    }
  };

  const openLogDrawer = (log) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const closeLogDrawer = () => {
    setDrawerOpen(false);
    setSelectedLog(null);
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  return {
    loading,
    dashboardLoading,
    metricsLoading,
    dashboardData,
    auditLogs,
    logMeta,
    auditorActivities,
    metricsData,
    reportsData,
    systemHealth,
    selectedLog,
    drawerOpen,
    filters,
    setFilters,
    updateFilters,
    openLogDrawer,
    closeLogDrawer,
    fetchDashboard,
    fetchAuditLogs,
    fetchAuditorActivity,
    fetchMetrics,
    fetchReports,
    fetchSystemHealth,
    exportLogs,
  };
}

export default useCompliance;
