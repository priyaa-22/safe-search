import React from "react";
import PageHeader from "../../components/admin/PageHeader";

export default function Profile() {
  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Admin Profile"
        description="Manage your account profile settings, cryptographic credentials, and session logs."
      />
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          The Profile settings portal is currently under development. In the next phase, you will be able to edit your profile details, reset password, and review security logs.
        </p>
      </div>
    </div>
  );
}
