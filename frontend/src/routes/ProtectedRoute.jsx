import React from "react";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/Loader";

export default function ProtectedRoute({ children, fallback }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner text="Authenticating..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
}
