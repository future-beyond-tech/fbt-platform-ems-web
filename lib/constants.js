export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/backend";

export const EMPLOYEE_TYPES = ["Permanent", "Temporary", "Retailer", "Intern"];
export const DEPARTMENT_TYPES = [
  "Administration",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "IT",
];

export const DOCUMENT_TYPES = [
  "Passport",
  "DriverLicense",
  "WorkPermit",
  "AadhaarCard",
  "BirthCertificate",
];

export const LEAVE_STATUSES = ["Requested", "Approved", "Rejected", "Cancelled"];

export const QUALIFICATION_GRADES = ["A+", "A", "B+", "B", "C", "Pass"];

export const APP_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Employees", href: "/employees" },
  { label: "Leaves", href: "/leaves" },
  { label: "Certifications", href: "/certifications" },
  { label: "Reports", href: "/reports" },
];

export const PAGE_SIZE = 8;
