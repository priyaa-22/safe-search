import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch user data
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/api/auth/me/");
      // The backend returns: { status: "success", data: { id, username, role, ... } }
      const userData = res.data?.data;
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      }
    } catch (err) {
      console.error("Failed to fetch current user", err);
      handleLogoutLocal();
    }
    return null;
  };

  const handleLogoutLocal = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Login handler
  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/login/", { username, password });
      // The backend returns: { status: "success", data: { access, refresh, user } }
      const { access, refresh } = res.data?.data || {};

      if (access) {
        localStorage.setItem("accessToken", access);
        setAccessToken(access);
      }
      if (refresh) {
        localStorage.setItem("refreshToken", refresh);
      }

      console.log("[TEMP] JWT received, access token stored:", access ? "Yes" : "No");

      // Fetch profile from /api/auth/me/ immediately after storing JWT
      const profileRes = await api.get("/api/auth/me/");
      console.log("[TEMP] /api/auth/me response data:", profileRes.data);
      const profileData = profileRes.data?.data;
      if (profileData) {
        setUser(profileData);
        setIsAuthenticated(true);
        console.log("[TEMP] AuthContext user set to:", profileData);
      } else {
        throw new Error("Failed to fetch user profile after login.");
      }

      setIsLoading(false);
      return { success: true, user: profileData };
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await api.post("/api/auth/logout/", { refresh: refreshToken });
      } catch (err) {
        console.error("Logout request failed", err);
      }
    }
    handleLogoutLocal();
  };

  // Refresh user data manually
  const refreshUser = async () => {
    return await fetchCurrentUser();
  };

  // Initial load effect
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchCurrentUser().finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    // Listen to axios interceptor logout event
    const handleAuthLogout = () => {
      handleLogoutLocal();
    };
    window.addEventListener("auth-logout", handleAuthLogout);
    return () => {
      window.removeEventListener("auth-logout", handleAuthLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
