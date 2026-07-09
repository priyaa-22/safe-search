import React from "react";
import { useAuth } from "../context/AuthContext";
import { hasAnyRole, getRoleFromUser } from "../config/permissions";
import { Spinner } from "../components/Loader";

export default function RoleRoute({ children, allowedRoles, fallback = null }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log(`[TEMP][RoleRoute] Current route: ${window.location.pathname}`);
  console.log(`[TEMP][RoleRoute] AuthContext user:`, user);
  console.log(`[TEMP][RoleRoute] RoleRoute role resolved: ${getRoleFromUser(user)}, allowedRoles: ${allowedRoles}, isAuthenticated: ${isAuthenticated}`);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-55/40">
        <Spinner text="Verifying access credentials..." />
      </div>
    );
  }

  if (!isAuthenticated || !hasAnyRole(user, allowedRoles)) {
    console.log(`[TEMP][RoleRoute] Access Denied. Redirecting to fallback.`);
    return fallback;
  }

  return children;
}
