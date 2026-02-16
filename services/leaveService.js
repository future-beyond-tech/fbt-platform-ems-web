import api from "@/services/api";

const BASE = "/Leave";

export const leaveService = {
  getLeavesByEmployee: (employeeId) => api.get(`${BASE}/employee/${employeeId}`),
  createLeave: (employeeId, payload) => api.post(`${BASE}/employee/${employeeId}`, payload),
  updateLeave: (id, payload) => api.put(`${BASE}/${id}`, payload),
  deleteLeave: (id) => api.delete(`${BASE}/${id}`),
};

export default leaveService;
