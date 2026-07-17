import React from "react";
import MetricsPage from "../../components/MetricsPage";
import { useAuth } from "../../context/AuthContext";
import { getRoleFromUser } from "../../config/permissions";

export default function Metrics({ showToast }) {
  const { user } = useAuth();
  const role = getRoleFromUser(user);

  return <MetricsPage role={role} showToast={showToast} autoRefreshMs={15000} />;
}
