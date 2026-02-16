import api from "@/services/api";

const BASE = "/EmployeeSalary";

export const salaryService = {
  getSalaryByEmployee: (employeeId) => api.get(`${BASE}/${employeeId}`),
  calculateSalary: (employeeId) => api.post(`${BASE}/CalculateSalary/${employeeId}`),
};

export default salaryService;
