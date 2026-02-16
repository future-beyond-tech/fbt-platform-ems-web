import api from "@/services/api";

const BASE = "/Qualification";

export const qualificationService = {
  getQualificationsByEmployee: (employeeId) => api.get(`${BASE}/employee/${employeeId}`),
  createQualification: (employeeId, payload) => api.post(`${BASE}/employee/${employeeId}`, payload),
  updateQualification: (id, payload) => api.put(`${BASE}/${id}`, payload),
  deleteQualification: (id) => api.delete(`${BASE}/${id}`),
};

export default qualificationService;
