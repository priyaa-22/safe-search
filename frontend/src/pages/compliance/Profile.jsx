import React from "react";
import PageHeader from "../../components/admin/PageHeader";
import { ContentCard, Badge, StatusBadge } from "../../components/ui";
import { User, Shield, Mail, Key, Clock, Award } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ComplianceProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl animate-[fadeIn_0.3s_ease-out]">
      <PageHeader
        title="Compliance Officer Security Profile"
        subtitle="Read-Only Governance Role & Security Clearances"
      />

      <ContentCard className="p-8 space-y-6">
        <div className="flex items-center gap-5 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-3xl flex items-center justify-center font-bold text-2xl shadow-md">
            {user?.first_name?.[0] || user?.username?.[0] || "C"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || "Compliance Officer"}
            </h2>
            <p className="text-xs text-gray-500 font-mono">@{user?.username || "compliance.officer"}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="emerald" className="px-3 py-1 font-semibold">
                Compliance Officer
              </Badge>
              <StatusBadge status="Active" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
            <span className="font-bold text-gray-900 flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-emerald-600" />
              Role & Permissions Scope
            </span>
            <p className="text-gray-600 leading-relaxed">
              Read-only monitoring and audit governance role. Authorized for audit trail inspection, security analytics, observability dashboard, and report export.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
            <span className="font-bold text-gray-900 flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-indigo-600" />
              Security Clearance
            </span>
            <p className="text-gray-600 leading-relaxed">
              Full Observability Clearance (Level 3 Audit Custody). Principle of Least Privilege applies: document payload decryption is disabled.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 text-xs text-gray-500 flex justify-between font-mono">
          <span>Session Token: JWT Signed</span>
          <span>Last Login: Active Session</span>
        </div>
      </ContentCard>
    </div>
  );
}
