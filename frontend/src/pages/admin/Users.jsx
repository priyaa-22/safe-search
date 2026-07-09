import React from "react";
import PageHeader from "../../components/admin/PageHeader";

export default function Users() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="User Management"
        description="Configure internal analysts and administrators access controls."
      />
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          The User Management module is currently under development. In the next phase, you will be able to invite, update, and manage analyst roles.
        </p>
      </div>
    </div>
  );
}
