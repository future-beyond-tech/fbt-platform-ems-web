import api from "@/services/api";

const attendanceService = {
  async checkIn(payload) {
    const response = await api.post("/attendance/check-in", payload || {});
    return response.data;
  },

  async checkOut(payload) {
    const response = await api.post("/attendance/check-out", payload || {});
    return response.data;
  },

  async getEmployeeAttendance(employeeId) {
    const response = await api.get(`/attendance/employees/${employeeId}`);
    return response.data;
  },
};

export default attendanceService;
