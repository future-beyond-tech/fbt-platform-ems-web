import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.title ||
      error.message ||
      "Unexpected server error";

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("api:error", {
          detail: {
            status,
            message,
          },
        }),
      );
    }

    if (status === 401) {
      error.message = "Unauthorized request. Please sign in again.";
    }

    if (status >= 500) {
      error.message = "Server error occurred. Please try again shortly.";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
