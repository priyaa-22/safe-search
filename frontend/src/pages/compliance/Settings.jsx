import React from "react";
import PageHeader from "../../components/admin/PageHeader";
import { ContentCard, Badge } from "../../components/ui";
import { Settings, Lock, Eye, ShieldAlert } from "lucide-react";

export default function ComplianceSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl animate-[fadeIn_0.3s_ease-out]">
      <PageHeader
        title="Compliance & Governance Settings"
        subtitle="Read-Only View of Enterprise Compliance Rules & System Governance Constraints"
      />

      <ContentCard className="p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              Governance & Least Privilege Policy
            </h3>
            <p className="text-xs text-gray-500">System settings are administrative and read-only for Compliance Officers.</p>
          </div>
          <Badge variant="emerald">READ-ONLY MODE</Badge>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-gray-50 rounded-2xl flex items-start justify-between">
            <div>
              <span className="font-bold text-gray-900 block">Audit Log Retention Policy</span>
              <span className="text-gray-500">All audit logs are immutably retained for 7 years in cold storage.</span>
            </div>
            <Badge variant="blue">7 Years</Badge>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl flex items-start justify-between">
            <div>
              <span className="font-bold text-gray-900 block">Cryptographic Key Rotation Window</span>
              <span className="text-gray-500">Auditor RSA public keys require rotation every 90 days.</span>
            </div>
            <Badge variant="indigo">90 Days</Badge>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl flex items-start justify-between">
            <div>
              <span className="font-bold text-gray-900 block">Encrypted Document Decryption Restrict</span>
              <span className="text-gray-500">Decryption is restricted to internal search queries with trapdoor access.</span>
            </div>
            <Badge variant="rose">Enforced</Badge>
          </div>
        </div>
      </ContentCard>
    </div>
  );
}
