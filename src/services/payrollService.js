import api from "@/services/api";

const payrollService = {
  async runPayroll(payload) {
    const response = await api.post("/payroll/run", payload);
    return response.data;
  },

  async getPayrollRuns() {
    const response = await api.get("/payroll/runs");
    return response.data;
  },
};

export default payrollService;
