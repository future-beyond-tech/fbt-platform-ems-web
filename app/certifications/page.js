"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import EmptyState from "@/components/ui/EmptyState";
import DataTable from "@/components/tables/DataTable";
import StatusBadge from "@/components/badges/StatusBadge";
import employeeService from "@/services/employeeService";
import certificationService from "@/services/certificationService";
import { formatDate, getDaysUntil, getErrorMessage, toArray } from "@/lib/utils";
import { useToast } from "@/components/ui/toast-context";

export default function CertificationsPage() {
  const { addToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("All");

  const fetchCertifications = useCallback(async () => {
    setLoading(true);
    try {
      const employeesResult = await employeeService.getEmployees();
      const employees = toArray(employeesResult);

      const certificationRequests = await Promise.allSettled(
        employees.map(async (employee) => {
          const result = await certificationService.getCertificationsByEmployee(employee.employeeId);
          return toArray(result).map((certification) => ({
            ...certification,
            employeeName: employee.name,
            employeeId: employee.employeeId,
            departmentType: employee.departmentType,
          }));
        }),
      );

      const data = certificationRequests
        .filter((item) => item.status === "fulfilled")
        .flatMap((item) => item.value)
        .sort((a, b) => new Date(a.expiryDate || "9999-12-31") - new Date(b.expiryDate || "9999-12-31"));

      setRows(data);
    } catch (error) {
      addToast({
        type: "error",
        title: "Certifications load failed",
        description: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const searchMatch =
        row.employeeName?.toLowerCase().includes(search.toLowerCase().trim()) ||
        row.certificationName?.toLowerCase().includes(search.toLowerCase().trim());

      const days = getDaysUntil(row.expiryDate);
      const expiringSoon = days !== null && days >= 0 && days <= 30;
      const expired = days !== null && days < 0;

      const expiryMatch =
        expiryFilter === "All" ||
        (expiryFilter === "ExpiringSoon" && expiringSoon) ||
        (expiryFilter === "Expired" && expired) ||
        (expiryFilter === "Valid" && !expiringSoon && !expired);

      return searchMatch && expiryMatch;
    });
  }, [rows, search, expiryFilter]);

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.employeeName}</p>
          <p className="text-xs text-slate-500">{row.departmentType}</p>
        </div>
      ),
    },
    {
      key: "certification",
      header: "Certification",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.certificationName}</p>
          <p className="text-xs text-slate-500">{row.issuingOrganization}</p>
        </div>
      ),
    },
    {
      key: "issued",
      header: "Issued",
      render: (row) => formatDate(row.issueDate),
    },
    {
      key: "expiry",
      header: "Expiry",
      render: (row) => formatDate(row.expiryDate),
    },
    {
      key: "health",
      header: "Status",
      render: (row) => {
        const days = getDaysUntil(row.expiryDate);
        if (days === null) return <StatusBadge value="Valid" />;
        if (days < 0) return <StatusBadge value="Expired" />;
        if (days <= 30) return <StatusBadge value="Expiring" />;
        return <StatusBadge value="Valid" />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certification Registry"
        description="Visibility into active credentials and upcoming certification expirations."
      />

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px]">
        <Input
          placeholder="Search employee or certification"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={expiryFilter} onChange={(e) => setExpiryFilter(e.target.value)}>
          <option value="All">All Records</option>
          <option value="ExpiringSoon">Expiring Soon</option>
          <option value="Expired">Expired</option>
          <option value="Valid">Valid</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        rowKey={(row) => row.certificationId}
        loading={loading}
        emptyState={
          <EmptyState
            title="No certifications found"
            description="No certification records are available for current filters."
          />
        }
      />
    </div>
  );
}
