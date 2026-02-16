import api from "@/services/api";

const EMPLOYEE_ENDPOINT = "/employee";

export const employeeService = {
  getEmployees: () => api.get(EMPLOYEE_ENDPOINT),
  getEmployeeById: (id) => api.get(`${EMPLOYEE_ENDPOINT}/${id}`),
  createEmployee: (payload) => api.post(EMPLOYEE_ENDPOINT, payload),
  updateEmployee: (id, payload) => api.put(`${EMPLOYEE_ENDPOINT}/${id}`, payload),
  deleteEmployee: (id) => api.delete(`${EMPLOYEE_ENDPOINT}/${id}`),
};

export default employeeService;
