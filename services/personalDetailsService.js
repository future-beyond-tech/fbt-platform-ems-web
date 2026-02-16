import employeeService from "@/services/employeeService";

export const personalDetailsService = {
  async getPersonalDetails(employeeId) {
    const employee = await employeeService.getEmployeeById(employeeId);
    return employee?.personalDetails || null;
  },

  async updatePersonalDetails(employeeId, payload) {
    const employee = await employeeService.getEmployeeById(employeeId);
    return employeeService.updateEmployee(employeeId, {
      ...employee,
      personalDetails: {
        ...(employee?.personalDetails || {}),
        ...payload,
      },
    });
  },
};

export default personalDetailsService;
