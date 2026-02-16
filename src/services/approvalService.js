import api from "@/services/api";

const approvalService = {
  async submitApproval(payload) {
    const response = await api.post("/approvals", payload);
    return response.data;
  },

  async transitionApproval(id, payload) {
    const response = await api.put(`/approvals/${id}/transition`, payload);
    return response.data;
  },

  async getApprovals(pageNumber = 1, pageSize = 10) {
    const response = await api.get("/approvals", {
      params: {
        pageNumber,
        pageSize,
      },
    });
    return response.data;
  },
};

export default approvalService;
