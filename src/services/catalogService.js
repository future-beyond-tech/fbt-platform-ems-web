import api from "@/services/api";

const catalogService = {
  async getCatalog(resource, pageNumber = 1, pageSize = 10) {
    const response = await api.get(`/${resource}`, {
      params: {
        pageNumber,
        pageSize,
      },
    });

    return response.data;
  },

  getRoles: (pageNumber, pageSize) => catalogService.getCatalog("roles", pageNumber, pageSize),
  getPermissions: (pageNumber, pageSize) =>
    catalogService.getCatalog("permissions", pageNumber, pageSize),
  getDepartments: (pageNumber, pageSize) =>
    catalogService.getCatalog("departments", pageNumber, pageSize),
  getDesignations: (pageNumber, pageSize) =>
    catalogService.getCatalog("designations", pageNumber, pageSize),
  getLocations: (pageNumber, pageSize) =>
    catalogService.getCatalog("locations", pageNumber, pageSize),
  getTeams: (pageNumber, pageSize) => catalogService.getCatalog("teams", pageNumber, pageSize),
  getAnalytics: (pageNumber, pageSize) =>
    catalogService.getCatalog("analytics", pageNumber, pageSize),
  getOvertime: (pageNumber, pageSize) =>
    catalogService.getCatalog("overtime", pageNumber, pageSize),
  getPayslips: (pageNumber, pageSize) =>
    catalogService.getCatalog("payslips", pageNumber, pageSize),
  getTaxes: (pageNumber, pageSize) => catalogService.getCatalog("taxes", pageNumber, pageSize),
  getAppraisals: (pageNumber, pageSize) =>
    catalogService.getCatalog("appraisals", pageNumber, pageSize),
  getAllowances: (pageNumber, pageSize) =>
    catalogService.getCatalog("allowances", pageNumber, pageSize),
  getAudits: (pageNumber, pageSize) => catalogService.getCatalog("audits", pageNumber, pageSize),
  getComplianceReports: (pageNumber, pageSize) =>
    catalogService.getCatalog("compliance-reports", pageNumber, pageSize),
  getDashboardMetrics: (pageNumber, pageSize) =>
    catalogService.getCatalog("dashboard-metrics", pageNumber, pageSize),
};

export default catalogService;
