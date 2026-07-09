import React from "react";
import PageHeader from "../../components/admin/PageHeader";

export default function Metrics() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="System Metrics"
        description="Monitor cryptographic performance, query frequencies, and index build times."
      />
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          The System Metrics visualization and logging dashboard is under development. In the next phase, charts detailing index sizes, latency, and search patterns will be displayed here.
        </p>
      </div>
    </div>
  );
}
