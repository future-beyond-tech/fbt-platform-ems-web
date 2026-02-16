import api from "@/services/api";

const authService = {
  async login(payload) {
    const response = await api.post("/auth/login", payload);
    return response.data;
  },

  async register(payload) {
    const response = await api.post("/auth/register", payload);
    return response.data;
  },

  async refresh(payload) {
    const response = await api.post("/auth/refresh", payload);
    return response.data;
  },

  async logout(payload) {
    try {
      const response = await api.post("/auth/logout", payload);
      return response.data;
    } catch {
      return null;
    }
  },
};

export default authService;
