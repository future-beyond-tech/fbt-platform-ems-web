import api from "@/services/api";

const BASE = "/Experience";

export const experienceService = {
  getExperiencesByEmployee: (employeeId) => api.get(`${BASE}/employee/${employeeId}`),
  createExperience: (employeeId, payload) => api.post(`${BASE}/employee/${employeeId}`, payload),
  updateExperience: (id, payload) => api.put(`${BASE}/${id}`, payload),
  deleteExperience: (id) => api.delete(`${BASE}/${id}`),
};

export default experienceService;
