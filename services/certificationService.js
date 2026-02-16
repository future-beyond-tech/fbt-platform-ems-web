import api from "@/services/api";

const BASE = "/Certification";

export const certificationService = {
  getCertificationsByEmployee: (employeeId) => api.get(`${BASE}/employee/${employeeId}`),
  createCertification: (employeeId, payload) => api.post(`${BASE}/employee/${employeeId}`, payload),
  updateCertification: (id, payload) => api.put(`${BASE}/${id}`, payload),
  deleteCertification: (id) => api.delete(`${BASE}/${id}`),
};

export default certificationService;
