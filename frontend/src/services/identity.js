import api from "./api";

export const getIdentities = async () => {
  const response = await api.get("/api/users/");
  return response.data?.data || [];
};

export const getIdentity = async (id) => {
  const response = await api.get(`/api/users/${id}/`);
  return response.data?.data;
};

export const createIdentity = async (payload) => {
  const response = await api.post("/api/users/", payload);
  return response.data?.data;
};

export const updateIdentity = async (id, payload) => {
  const response = await api.patch(`/api/users/${id}/`, payload);
  return response.data?.data;
};

export const deleteIdentity = async (id) => {
  const response = await api.delete(`/api/users/${id}/`);
  return response.data?.data;
};

export const searchIdentities = async (query = "", role = "", status = "") => {
  const identities = await getIdentities();
  let filtered = [...identities];

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        (item.fullName && item.fullName.toLowerCase().includes(q)) ||
        (item.username && item.username.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.organization && item.organization.toLowerCase().includes(q)) ||
        (item.role && item.role.toLowerCase().includes(q))
    );
  }

  if (role) {
    filtered = filtered.filter((item) => item.role === role);
  }

  if (status) {
    filtered = filtered.filter((item) => item.status === status);
  }

  return filtered;
};
