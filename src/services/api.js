import axios from "axios";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  setSessionMeta,
} from "@/utils/tokenManager";
import { parseApiError } from "@/utils/formatters";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5022/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let requestQueue = [];

function flushQueue(error, token = null) {
  requestQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  requestQueue = [];
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken,
  });

  const payload = response.data || {};
  if (!payload.accessToken) {
    throw new Error("Invalid refresh token response");
  }

  setAccessToken(payload.accessToken);
  setRefreshToken(payload.refreshToken || refreshToken);
  setSessionMeta({
    expiresAtUtc: payload.expiresAtUtc,
    roles: payload.roles,
  });

  return payload.accessToken;
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((queueError) => Promise.reject(queueError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        flushQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        clearSession();

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("auth:logout", {
              detail: {
                reason: "session_expired",
              },
            }),
          );
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const parsedError = parseApiError(error);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("api:error", {
          detail: parsedError,
        }),
      );
    }

    return Promise.reject(error);
  },
);

export default api;
