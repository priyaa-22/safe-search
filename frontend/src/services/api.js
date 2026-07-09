import axios from "axios";

export const API_BASE_URL = "https://safe-search-e9jp.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid infinite loop if refresh request itself fails
      if (
        originalRequest.url === "/api/auth/refresh/" ||
        originalRequest.url === "/api/auth/login/"
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        isRefreshing = false;
        window.dispatchEvent(new Event("auth-logout"));
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access: newAccessToken, refresh: newRefreshToken } = res.data?.data || res.data || {};

        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
        }
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        processQueue(null, newAccessToken);
        isRefreshing = false;

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("auth-logout"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;