import api from "@/services/api";

const BASE = "/Report";

export const reportService = {
  getReportData: () => api.get(BASE),
  generateReport: () => api.get(`${BASE}/Generate`),
};

export default reportService;
