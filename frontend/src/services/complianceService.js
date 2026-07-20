import api from "./api";

export const complianceService = {
  /**
   * Fetch compliance dashboard statistics, metrics, and recent activity
   */
  getDashboard: async () => {
    const response = await api.get("/api/compliance/dashboard/");
    return response.data;
  },

  /**
   * Fetch paginated and filtered audit logs
   */
  getAuditLogs: async (params = {}) => {
    const response = await api.get("/api/compliance/audit-logs/", { params });
    return response.data;
  },

  /**
   * Fetch auditor activity history
   */
  getAuditorActivity: async (params = {}) => {
    const response = await api.get("/api/compliance/auditor-activity/", { params });
    return response.data;
  },

  /**
   * Fetch interactive metrics data for charts
   */
  getMetrics: async () => {
    const response = await api.get("/api/compliance/metrics/");
    return response.data;
  },

  /**
   * Fetch structured compliance reports
   */
  getReports: async () => {
    const response = await api.get("/api/compliance/reports/");
    return response.data;
  },

  /**
   * Fetch system health diagnostics
   */
  getSystemHealth: async () => {
    const response = await api.get("/api/compliance/system-health/");
    return response.data;
  },

  /**
   * Download exported audit logs in CSV, Excel (.xlsx), or PDF format
   */
  exportLogs: async (params = {}) => {
    const response = await api.get("/api/compliance/export-logs/", {
      params,
      responseType: "blob",
    });
    return response;
  },
};

export default complianceService;
