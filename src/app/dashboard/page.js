"use client";

import { useCallback, useEffect, useState } from "react";
import employeeService from "@/services/employeeService";
import approvalService from "@/services/approvalService";
import payrollService from "@/services/payrollService";
import catalogService from "@/services/catalogService";
import Loader from "@/components/Loader";
import { parseApiError, toArray } from "@/utils/formatters";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    employees: 0,
    approvals: 0,
    payrollRuns: 0,
    departments: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [employeesRes, approvalsRes, payrollRes, departmentsRes] = await Promise.allSettled([
        employeeService.getEmployees(1, 10),
        approvalService.getApprovals(1, 10),
        payrollService.getPayrollRuns(),
        catalogService.getDepartments(1, 10),
      ]);

      setStats({
        employees:
          employeesRes.status === "fulfilled"
            ? employeesRes.value?.totalCount ?? toArray(employeesRes.value).length
            : 0,
        approvals:
          approvalsRes.status === "fulfilled"
            ? approvalsRes.value?.totalCount ?? toArray(approvalsRes.value).length
            : 0,
        payrollRuns:
          payrollRes.status === "fulfilled" ? toArray(payrollRes.value).length : 0,
        departments:
          departmentsRes.status === "fulfilled"
            ? departmentsRes.value?.totalCount ?? toArray(departmentsRes.value).length
            : 0,
      });
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <Loader text="Loading dashboard metrics..." />;

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">Operational overview of workforce and workflows.</p>
      </header>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Employees" value={stats.employees} />
        <StatCard title="Pending Approvals" value={stats.approvals} />
        <StatCard title="Payroll Runs" value={stats.payrollRuns} />
        <StatCard title="Departments" value={stats.departments} />
      </div>
    </section>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
