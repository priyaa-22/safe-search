import React from "react";
import { useAuth } from "../context/AuthContext";
import { canAccess, getRoleFromUser } from "../config/permissions";
import { Spinner } from "../components/Loader";

export default function PermissionRoute({ children, feature, fallback = null }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log(`[TEMP][PermissionRoute] Current route: ${window.location.pathname}`);
  console.log(`[TEMP][PermissionRoute] AuthContext user:`, user);
  console.log(`[TEMP][PermissionRoute] PermissionRoute role resolved: ${getRoleFromUser(user)}, feature: ${feature}, canAccess: ${canAccess(user, feature)}, isAuthenticated: ${isAuthenticated}`);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-55/40">
        <Spinner text="Verifying feature permissions..." />
      </div>
    );
  }

  if (!isAuthenticated || !canAccess(user, feature)) {
    console.log(`[TEMP][PermissionRoute] Access Denied for feature ${feature}. Redirecting to fallback.`);
    return fallback;
  }

  return children;
}
