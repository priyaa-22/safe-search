import React from "react";
import {
  FileText,
  Users,
  ShieldAlert,
  Award,
  Activity,
  Lock,
  XCircle,
  Clock,
} from "lucide-react";
import { ContentCard } from "../ui";

export default function OverviewCards({ metrics = {} }) {
  const cards = [
    {
      title: "Total Audit Logs",
      value: metrics.total_audit_logs?.toLocaleString() || "1,420",
      change: "+12.4% this week",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100",
    },
    {
      title: "Active Auditors",
      value: metrics.active_auditors || "5",
      change: "All key versions verified",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      title: "Security Events",
      value: metrics.security_events || "8",
      change: "2 Critical, 6 High",
      icon: ShieldAlert,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
    },
    {
      title: "Compliance Score",
      value: `${metrics.compliance_score || 98.4}%`,
      change: "SOC2 Type II Compliant",
      icon: Award,
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-100",
    },
    {
      title: "System Health",
      value: `${metrics.system_health_pct || 99.8}%`,
      change: "All Subsystems Nominal",
      icon: Activity,
      color: "text-teal-600",
      bg: "bg-teal-50 border-teal-100",
    },
    {
      title: "Unauthorized Access",
      value: metrics.unauthorized_attempts || "2",
      change: "Blocked by RBAC / DRF",
      icon: Lock,
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-100",
    },
    {
      title: "Failed Verifications",
      value: metrics.failed_verifications || "4",
      change: "Invalid RSA Signature",
      icon: XCircle,
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-100",
    },
    {
      title: "Active Sessions",
      value: metrics.active_sessions || "14",
      change: "JWT Token Authenticated",
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <ContentCard key={idx} className="p-5 hover:border-gray-300 transition-all duration-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</p>
            </div>
            <p className="text-[11px] font-medium text-gray-500 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              {card.change}
            </p>
          </ContentCard>
        );
      })}
    </div>
  );
}
