import React from "react";
import PageHeader from "../../components/admin/PageHeader";

export default function Auditors() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Auditor Management"
        description="Register external auditors, authorize credentials, and manage PEKS public/private key pairs."
      />
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          The Auditor Management module is currently under development. In the next phase, you will be able to register external auditors and distribute cryptographic keys.
        </p>
      </div>
    </div>
  );
}
