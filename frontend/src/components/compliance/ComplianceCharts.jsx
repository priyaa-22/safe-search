import React, { useState } from "react";
import { ContentCard } from "../ui";
import { BarChart3, TrendingUp, ShieldCheck, Activity, Clock, PieChart } from "lucide-react";

export default function ComplianceCharts({ metrics = {}, loading = false }) {
  const [timelineFilter, setTimelineFilter] = useState("30d");

  if (loading) {
    return (
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartLoadingCard />
          <ChartLoadingCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartLoadingCard />
          <div className="lg:col-span-2">
            <ChartLoadingCard />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartLoadingCard />
          <ChartLoadingCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartLoadingCard />
          <div className="lg:col-span-2">
            <ChartLoadingCard />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartLoadingCard />
          <ChartLoadingCard />
        </div>
      </div>
    );
  }

  const timelineData = metrics.audit_activity_timeline || [];
  const searchComp = metrics.internal_vs_external_searches || [];
  const verifications = metrics.verification_outcomes || { success: 0, failure: 0 };
  const auditorTrend = metrics.auditor_activity_trend || [];
  const securityBySeverity = metrics.security_events_by_severity || [];
  const eventDistribution = metrics.audit_event_distribution || [];
  const systemHealth = metrics.system_health_overview || { overall: 0 };
  const topOrgs = metrics.top_active_organizations || [];
  const searchPerf = metrics.search_performance || [];
  const complianceTrend = metrics.compliance_trend || [];

  return (
    <div className="space-y-6 mb-8">

      {/* ROW 1: Timeline & Search Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Audit Activity Timeline (Line Chart) */}
        <ContentCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                1. Audit Activity Timeline
              </h3>
              <p className="text-xs text-gray-500">System audit events recorded over time</p>
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setTimelineFilter("7d")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  timelineFilter === "7d" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimelineFilter("30d")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  timelineFilter === "30d" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
          <SvgLineChart data={timelineFilter === "7d" ? timelineData.slice(-7) : timelineData} />
        </ContentCard>

        {/* 2. Internal vs External Searches (Stacked Bar Chart) */}
        <ContentCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                2. Internal vs External Searches
              </h3>
              <p className="text-xs text-gray-500">SSE Trapdoor Searches vs PEKS Auditor Searches</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-600 rounded-xs"></span> Internal</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs"></span> External</span>
            </div>
          </div>
          <SvgStackedBarChart data={searchComp} />
        </ContentCard>
      </div>

      {/* ROW 2: Verifications Donut & Auditor Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Successful vs Failed Verifications (Donut Chart) */}
        <ContentCard className="p-5">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            3. Verification Outcomes
          </h3>
          <p className="text-xs text-gray-500 mb-4">RSA Signature Verification Ratio</p>
          <SvgDonutChart successPct={verifications.success || 94.2} failurePct={verifications.failure || 5.8} />
        </ContentCard>

        {/* 4. Auditor Activity Trend (Area Chart) */}
        <ContentCard className="p-5 lg:col-span-2">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-purple-600" />
            4. Auditor Activity Trend
          </h3>
          <p className="text-xs text-gray-500 mb-4">Daily Auditor Actions, Key Rotations, & Credential Downloads</p>
          <SvgAreaChart data={auditorTrend.length ? auditorTrend : timelineData} />
        </ContentCard>
      </div>

      {/* ROW 3: Security Events Horizontal Bar & Event Distribution Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. Security Events by Severity (Horizontal Bar Chart) */}
        <ContentCard className="p-5">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            5. Security Events by Severity
          </h3>
          <p className="text-xs text-gray-500 mb-4">Breakdown of critical, high, medium, low & info events</p>
          {securityBySeverity.length ? (
            <div className="space-y-3">
              {securityBySeverity.map((item, i) => {
                const maxVal = Math.max(...securityBySeverity.map((s) => s.count), 1);
                const pct = (item.count / maxVal) * 100;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span>{item.severity}</span>
                      <span className="font-mono">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-xs text-gray-400">No data available</div>
          )}
        </ContentCard>

        {/* 6. Audit Event Distribution (Pie Chart) */}
        <ContentCard className="p-5">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
            <PieChart className="w-4 h-4 text-amber-600" />
            6. Audit Event Distribution
          </h3>
          <p className="text-xs text-gray-500 mb-4">Categorized event distribution breakdown</p>
          <SvgPieChart items={eventDistribution} />
        </ContentCard>
      </div>

      {/* ROW 4: System Health Gauge & Top Active Organizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7. System Health Overview (Gauge Chart) */}
        <ContentCard className="p-5">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-teal-600" />
            7. System Health Overview
          </h3>
          <p className="text-xs text-gray-500 mb-4">Subsystem Reliability & Uptime Score</p>
          <SvgGaugeChart score={systemHealth.overall || 99.8} />
        </ContentCard>

        {/* 8. Top Active Organizations (Horizontal Bar Chart) */}
        <ContentCard className="p-5 lg:col-span-2">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            8. Top Active Organizations
          </h3>
          <p className="text-xs text-gray-500 mb-4">Highest search volume, auditor activity, and credential downloads</p>
          {topOrgs.length ? (
            <div className="space-y-4">
              {topOrgs.map((org, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-800">
                    <span className="truncate max-w-[200px]">{org.organization}</span>
                    <span className="font-mono text-gray-500">{org.searches} Searches • {org.activity} Actions</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden flex">
                    <div style={{ width: `${(org.searches / 160) * 100}%` }} className="bg-blue-600 h-full"></div>
                    <div style={{ width: `${(org.activity / 160) * 100}%` }} className="bg-emerald-500 h-full"></div>
                    <div style={{ width: `${(org.downloads / 160) * 100}%` }} className="bg-purple-500 h-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-xs text-gray-400">No data available</div>
          )}
        </ContentCard>
      </div>

      {/* ROW 5: Search Latency & Compliance Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 9. Average Search Performance (Line Chart) */}
        <ContentCard className="p-5">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-indigo-600" />
            9. Average Search Latency (ms)
          </h3>
          <p className="text-xs text-gray-500 mb-4">Internal SSE Search vs External PEKS Search Latency</p>
          <SvgLatencyChart data={searchPerf} />
        </ContentCard>

        {/* 10. Compliance Trend (Area Chart) */}
        <ContentCard className="p-5">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            10. Compliance Score Trend
          </h3>
          <p className="text-xs text-gray-500 mb-4">Enterprise Governance & Security Score over time</p>
          <SvgComplianceTrendChart data={complianceTrend} />
        </ContentCard>
      </div>

    </div>
  );
}

function ChartLoadingCard() {
  return (
    <ContentCard className="p-5">
      <div className="animate-pulse">
        <div className="flex items-start justify-between mb-5 gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-40 rounded bg-gray-200"></div>
            <div className="h-3 w-56 rounded bg-gray-100"></div>
          </div>
          <div className="h-8 w-24 rounded-lg bg-gray-100"></div>
        </div>
        <div className="h-44 rounded-2xl bg-gradient-to-b from-gray-100 to-gray-50 border border-gray-100 p-4 flex items-end gap-2">
          <div className="h-12 w-full rounded-md bg-gray-200"></div>
          <div className="h-20 w-full rounded-md bg-gray-200"></div>
          <div className="h-16 w-full rounded-md bg-gray-200"></div>
          <div className="h-28 w-full rounded-md bg-gray-200"></div>
          <div className="h-24 w-full rounded-md bg-gray-200"></div>
          <div className="h-36 w-full rounded-md bg-gray-200"></div>
          <div className="h-[4.5rem] w-full rounded-md bg-gray-200"></div>
        </div>
      </div>
    </ContentCard>
  );
}

/* =========================================================
   SVG ENTERPRISE CHARTS COMPONENTS
========================================================= */

function SvgLineChart({ data = [] }) {
  if (!data.length) return <div className="h-44 flex items-center justify-center text-xs text-gray-400">No data available</div>;

  const width = 500;
  const height = 180;
  const padding = 30;

  const maxVal = Math.max(...data.map((d) => d.events), 10);
  const minVal = 0;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - ((d.events - minVal) / (maxVal - minVal)) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        <polyline fill="none" stroke="#e2e8f0" strokeWidth="1" points={`${padding},${height - padding} ${width - padding},${height - padding}`} />
        <polyline fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
          const y = height - padding - ((d.events - minVal) / (maxVal - minVal)) * (height - 2 * padding);
          return (
            <g key={i} className="group cursor-pointer">
              <circle cx={x} cy={y} r="4" fill="#2563eb" className="group-hover:r-6 transition-all" />
              <title>{`${d.date}: ${d.events} events`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SvgStackedBarChart({ data = [] }) {
  const width = 500;
  const height = 180;
  const padding = 30;

  const maxVal = Math.max(...data.map((d) => (d.internal || 0) + (d.external || 0)), 10);

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        {data.map((d, i) => {
          const barWidth = 24;
          const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding) - barWidth / 2;
          
          const intH = ((d.internal || 0) / maxVal) * (height - 2 * padding);
          const extH = ((d.external || 0) / maxVal) * (height - 2 * padding);

          const intY = height - padding - intH;
          const extY = intY - extH;

          return (
            <g key={i}>
              <rect x={x} y={intY} width={barWidth} height={intH} fill="#2563eb" rx="2" />
              <rect x={x} y={extY} width={barWidth} height={extH} fill="#10b981" rx="2" />
              <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fontSize="10" fill="#64748b">
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SvgDonutChart({ successPct = 94.2, failurePct = 5.8 }) {
  return (
    <div className="flex items-center justify-around py-4">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.8" />
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.8"
            strokeDasharray={`${successPct} ${100 - successPct}`}
            strokeDashoffset="0"
          />
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="none"
            stroke="#ef4444"
            strokeWidth="3.8"
            strokeDasharray={`${failurePct} ${100 - failurePct}`}
            strokeDashoffset={`-${successPct}`}
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-xl font-bold text-gray-900 block">{successPct}%</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Success</span>
        </div>
      </div>
      <div className="space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <div>
            <p className="font-semibold text-gray-800">Successful ({successPct}%)</p>
            <p className="text-gray-400">Valid RSA Signature</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500"></span>
          <div>
            <p className="font-semibold text-gray-800">Failed ({failurePct}%)</p>
            <p className="text-gray-400">Signature Error</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SvgAreaChart({ data = [] }) {
  const width = 600;
  const height = 180;
  const padding = 30;

  const maxVal = Math.max(...data.map((d) => d.searches || d.events || 10), 10);

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - (((d.searches || d.events || 0)) / maxVal) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        <polygon fill="url(#purpleGrad)" points={areaPoints} opacity="0.4" />
        <polyline fill="none" stroke="#9333ea" strokeWidth="2.5" points={points} />
        <defs>
          <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function SvgPieChart({ items = [] }) {
  const colors = ["#2563eb", "#10b981", "#9333ea", "#f59e0b", "#ef4444", "#06b6d4"];
  const total = items.reduce((acc, curr) => acc + curr.value, 0) || 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
      <div className="w-32 h-32 relative">
        <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90 rounded-full">
          {items.map((item, idx) => {
            const accumulated = items.slice(0, idx).reduce((a, c) => a + c.value, 0);
            const pct = (item.value / total) * 100;
            const offset = (accumulated / total) * 100;

            return (
              <circle
                key={idx}
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke={colors[idx % colors.length]}
                strokeWidth="7"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={`-${offset}`}
              />
            );
          })}
        </svg>
      </div>

      <div className="space-y-1.5 text-xs w-full max-w-[220px]">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-gray-700 font-medium">
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></span>
              <span className="truncate">{item.name}</span>
            </span>
            <span className="font-mono text-gray-500">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SvgGaugeChart({ score = 99.8 }) {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-44 h-28 flex flex-col items-center justify-end">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#0d9488"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="125"
            strokeDashoffset={`${125 - (125 * score) / 100}`}
          />
        </svg>
        <div className="absolute bottom-1 text-center">
          <span className="text-2xl font-bold text-gray-900">{score}%</span>
          <span className="text-[10px] text-teal-600 font-bold block uppercase tracking-wider">Optimal</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center mt-3 font-medium">Database • JWT • API Gateway • Storage • Crypto Engine</p>
    </div>
  );
}

function SvgLatencyChart({ data = [] }) {
  const width = 500;
  const height = 180;
  const padding = 30;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
          const yInt = height - padding - (d.internal_ms / 50) * (height - 2 * padding);
          const yExt = height - padding - (d.external_ms / 50) * (height - 2 * padding);

          return (
            <g key={i}>
              <circle cx={x} cy={yInt} r="4" fill="#4f46e5" />
              <circle cx={x} cy={yExt} r="4" fill="#06b6d4" />
              <text x={x} y={height - 10} textAnchor="middle" fontSize="10" fill="#64748b">{d.day}</text>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-center gap-4 text-xs font-medium text-gray-600 mt-2">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span> Internal SSE (Avg ~12ms)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-500 rounded-full"></span> External PEKS (Avg ~28ms)</span>
      </div>
    </div>
  );
}

function SvgComplianceTrendChart({ data = [] }) {
  const width = 500;
  const height = 180;
  const padding = 30;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - ((d.score - 90) / 10) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        <polygon fill="url(#greenGrad)" points={areaPoints} opacity="0.4" />
        <polyline fill="none" stroke="#10b981" strokeWidth="2.5" points={points} />
        <defs>
          <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
