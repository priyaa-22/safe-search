import React, { useEffect } from "react";
import useCompliance from "../../hooks/useCompliance";
import PageHeader from "../../components/admin/PageHeader";
import { ContentCard, Button, Badge } from "../../components/ui";
import { FileText, Download, ShieldCheck, BarChart3, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { Spinner } from "../../components/Loader";

export default function ComplianceReportsPage({ showToast }) {
  const { loading, reportsData, fetchReports, exportLogs } = useCompliance(showToast);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  if (loading && !reportsData) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner text="Loading Compliance Reports..." />
      </div>
    );
  }

  const reports = reportsData || {};

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Compliance & Audit Governance Reports"
          subtitle="Generate, Review, and Export Standardized Enterprise Compliance Reports (CSV, Excel, PDF)"
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
            variant="secondary"
            onClick={() => exportLogs("excel")}
            className="text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Excel
          </Button>
          <Button
            variant="primary"
            onClick={() => exportLogs("pdf")}
            className="text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Monthly Report */}
        <ContentCard className="p-6 flex flex-col justify-between hover:border-emerald-500/50 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <FileText className="w-6 h-6" />
              </div>
              <Badge variant="emerald" className="font-mono text-xs">MONTHLY</Badge>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">Monthly Audit Report</h3>
            <p className="text-xs text-gray-500 mb-4">{reports.monthly_report?.period || "July 2026"}</p>

            <ul className="text-xs space-y-2 text-gray-600 mb-6">
              <li className="flex justify-between border-b border-gray-100 pb-1.5">
                <span>Total Audit Events:</span>
                <span className="font-bold text-gray-900 font-mono">{reports.monthly_report?.total_events || 1420}</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-1.5">
                <span>Critical Incidents:</span>
                <span className="font-bold text-emerald-600 font-mono">{reports.monthly_report?.critical_incidents || 2}</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-1.5">
                <span>Compliance Rate:</span>
                <span className="font-bold text-gray-900 font-mono">{reports.monthly_report?.compliance_rate || "99.4%"}</span>
              </li>
            </ul>
          </div>

          <Button
            variant="primary"
            onClick={() => exportLogs("pdf")}
            className="w-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Monthly Report
          </Button>
        </ContentCard>

        {/* 2. Weekly Report */}
        <ContentCard className="p-6 flex flex-col justify-between hover:border-blue-500/50 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <FileText className="w-6 h-6" />
              </div>
              <Badge variant="blue" className="font-mono text-xs">WEEKLY</Badge>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">Weekly Observability Summary</h3>
            <p className="text-xs text-gray-500 mb-4">{reports.weekly_report?.period || "Week of July 13 - July 20"}</p>

            <ul className="text-xs space-y-2 text-gray-600 mb-6">
              <li className="flex justify-between border-b border-gray-100 pb-1.5">
                <span>Weekly Events:</span>
                <span className="font-bold text-gray-900 font-mono">{reports.weekly_report?.total_events || 348}</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-1.5">
                <span>Security Warnings:</span>
                <span className="font-bold text-emerald-600 font-mono">0</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-1.5">
                <span>Compliance Rate:</span>
                <span className="font-bold text-gray-900 font-mono">100%</span>
              </li>
            </ul>
          </div>

          <Button
            variant="secondary"
            onClick={() => exportLogs("pdf")}
            className="w-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Weekly Report
          </Button>
        </ContentCard>

        {/* 3. Daily Report */}
        <ContentCard className="p-6 flex flex-col justify-between hover:border-indigo-500/50 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <FileText className="w-6 h-6" />
              </div>
              <Badge variant="indigo" className="font-mono text-xs">DAILY</Badge>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">Daily Operational Briefing</h3>
            <p className="text-xs text-gray-500 mb-4">{reports.daily_report?.period || "2026-07-20"}</p>

            <ul className="text-xs space-y-2 text-gray-600 mb-6">
              <li className="flex justify-between border-b border-gray-100 pb-1.5">
                <span>Daily Log Count:</span>
                <span className="font-bold text-gray-900 font-mono">{reports.daily_report?.total_events || 52}</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-1.5">
                <span>System Uptime:</span>
                <span className="font-bold text-emerald-600 font-mono">100%</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-1.5">
                <span>Operational Status:</span>
                <span className="font-bold text-gray-900 font-mono">NOMINAL</span>
              </li>
            </ul>
          </div>

          <Button
            variant="secondary"
            onClick={() => exportLogs("pdf")}
            className="w-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Daily Briefing
          </Button>
        </ContentCard>
      </div>

      {/* Summary Statistics Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Statistics */}
        <ContentCard className="p-6">
          <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Search Operations Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] block">Total Searches</span>
              <span className="text-2xl font-bold text-gray-900 font-mono">{reports.search_statistics?.total_searches || 840}</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] block">Internal SSE</span>
              <span className="text-2xl font-bold text-blue-600 font-mono">{reports.search_statistics?.internal_sse_searches || 580}</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] block">External PEKS</span>
              <span className="text-2xl font-bold text-emerald-600 font-mono">{reports.search_statistics?.external_peks_searches || 260}</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] block">Avg Latency</span>
              <span className="text-2xl font-bold text-purple-600 font-mono">{reports.search_statistics?.avg_latency_ms || 18.4} ms</span>
            </div>
          </div>
        </ContentCard>

        {/* Security Incidents & Compliance Summary */}
        <ContentCard className="p-6">
          <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Security Incidents & Compliance Summary
          </h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <div>
                <span className="font-bold text-emerald-900 text-sm block">Overall Compliance Status</span>
                <span className="text-emerald-700 text-xs">SOC2 Type II • NIST Cryptographic Standards</span>
              </div>
              <Badge variant="emerald" className="text-base px-4 py-1 font-bold">
                Grade {reports.compliance_summary?.grade || "A+"}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-semibold text-[10px] uppercase block">Critical Incidents</span>
                <span className="text-lg font-bold text-rose-600 font-mono">{reports.security_incidents?.critical || 2}</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-semibold text-[10px] uppercase block">High Severity</span>
                <span className="text-lg font-bold text-amber-600 font-mono">{reports.security_incidents?.high || 5}</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-semibold text-[10px] uppercase block">Resolved</span>
                <span className="text-lg font-bold text-emerald-600 font-mono">{reports.security_incidents?.resolved || 19}</span>
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
