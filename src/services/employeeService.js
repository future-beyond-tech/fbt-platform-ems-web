import api from "@/services/api";

const employeeService = {
  async getEmployees(pageNumber = 1, pageSize = 10) {
    const response = await api.get("/employees", {
      params: {
        pageNumber,
        pageSize,
      },
    });
    return response.data;
  },

  async getEmployeeById(id) {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  async createEmployee(payload) {
    const response = await api.post("/employees", payload);
    return response.data;
  },

  async updateEmployee(id, payload) {
    const response = await api.put(`/employees/${id}`, payload);
    return response.data;
  },

  async deleteEmployee(id) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};

export default employeeService;
