import { useState, useEffect } from "react";
import {
  searchIdentities,
  createIdentity as apiCreateIdentity,
  updateIdentity as apiUpdateIdentity,
  deleteIdentity as apiDeleteIdentity,
} from "../services/identity";
import { createApiError, createValidationError, createPermissionError } from "../utils/errors";

const handleAxiosError = (err) => {
  if (err.response) {
    const status = err.response.status;
    const errorData = err.response.data?.error || {};
    const code = errorData.code || "API_ERROR";
    const message = errorData.message || err.message;
    const details = errorData.details || null;

    if (status === 401 || status === 403) {
      return createPermissionError(message, code);
    }
    if (status === 400) {
      return createValidationError(message, details, code);
    }
    return createApiError(message, code, details);
  }
  return createApiError(err.message);
};

export default function useIdentity(searchQuery = "", selectedRole = "", selectedStatus = "", showToast) {
  const [identities, setIdentities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIdentities = async () => {
    setLoading(true);
    try {
      const data = await searchIdentities(searchQuery, selectedRole, selectedStatus);
      setIdentities(data);
    } catch (err) {
      console.error(err);
      const parsedError = handleAxiosError(err);
      if (showToast) showToast(parsedError.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdentities();
  }, [searchQuery, selectedRole, selectedStatus]);

  const createIdentity = async (payload) => {
    const previousIdentities = [...identities];

    // Optimistically insert a temp item
    const tempId = `temp-${Date.now()}`;
    const tempItem = {
      id: tempId,
      status: "Active",
      lastLogin: "Never",
      created: new Date().toISOString().split("T")[0],
      ...payload,
    };
    setIdentities((prev) => [tempItem, ...prev]);

    try {
      const result = await apiCreateIdentity(payload);
      // Replace with real backend result
      setIdentities((prev) =>
        prev.map((item) => (item.id === tempId ? result : item))
      );
      if (showToast) showToast("Identity created successfully", "success");
      return result;
    } catch (err) {
      // Rollback on failure
      setIdentities(previousIdentities);
      const parsedError = handleAxiosError(err);
      if (showToast) showToast(parsedError.message, "error");
      throw parsedError;
    }
  };

  const updateIdentity = async (id, payload) => {
    const previousIdentities = [...identities];

    // Optimistically update matching row in UI
    setIdentities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...payload } : item))
    );

    try {
      const result = await apiUpdateIdentity(id, payload);
      // Sync state with precise backend fields
      setIdentities((prev) =>
        prev.map((item) => (item.id === id ? result : item))
      );
      if (showToast) showToast("Identity updated successfully", "success");
      return result;
    } catch (err) {
      // Rollback
      setIdentities(previousIdentities);
      const parsedError = handleAxiosError(err);
      if (showToast) showToast(parsedError.message, "error");
      throw parsedError;
    }
  };

  const disableIdentity = async (id, newStatus) => {
    const previousIdentities = [...identities];

    // Optimistically toggle status
    setIdentities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      const result = await apiUpdateIdentity(id, { status: newStatus });
      setIdentities((prev) =>
        prev.map((item) => (item.id === id ? result : item))
      );
      if (showToast) {
        showToast(
          `Identity status updated to ${newStatus}`,
          newStatus === "Active" ? "success" : "warning"
        );
      }
      return result;
    } catch (err) {
      // Rollback
      setIdentities(previousIdentities);
      const parsedError = handleAxiosError(err);
      if (showToast) showToast(parsedError.message, "error");
      throw parsedError;
    }
  };

  const deleteIdentity = async (id) => {
    const previousIdentities = [...identities];

    // Optimistically remove from state list
    setIdentities((prev) => prev.filter((item) => item.id !== id));

    try {
      const result = await apiDeleteIdentity(id);
      if (showToast) showToast("Identity deleted successfully", "success");
      return result;
    } catch (err) {
      // Rollback
      setIdentities(previousIdentities);
      const parsedError = handleAxiosError(err);
      if (showToast) showToast(parsedError.message, "error");
      throw parsedError;
    }
  };

  return {
    identities,
    loading,
    refresh: fetchIdentities,
    createIdentity,
    updateIdentity,
    disableIdentity,
    deleteIdentity,
  };
}
