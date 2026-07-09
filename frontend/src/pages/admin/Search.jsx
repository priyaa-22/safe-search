import React from "react";
import PageHeader from "../../components/admin/PageHeader";

export default function SearchPlaceholder() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Search Operations"
        description="Monitor queries and HMACS trapdoors validation history."
      />
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          The Search Operations surveillance panel is currently under development. In the next phase, queries logs and SSE/PEKS transaction checks will be visible here.
        </p>
      </div>
    </div>
  );
}
