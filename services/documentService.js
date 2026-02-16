import api from "@/services/api";

const BASE = "/GovernmentDocument";

export const documentService = {
  getDocumentsByEmployee: (employeeId) => api.get(`${BASE}/employee/${employeeId}`),
  createDocument: (employeeId, payload) => api.post(`${BASE}/employee/${employeeId}`, payload),
  updateDocument: (id, payload) => api.put(`${BASE}/${id}`, payload),
  deleteDocument: (id) => api.delete(`${BASE}/${id}`),
};

export default documentService;
