"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ClipboardClock, ShieldCheck, Users } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/cards/StatCard";
import CardSkeleton from "@/components/skeletons/CardSkeleton";
import DataTable from "@/components/tables/DataTable";
import StatusBadge from "@/components/badges/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import employeeService from "@/services/employeeService";
import leaveService from "@/services/leaveService";
import certificationService from "@/services/certificationService";
import { DEPARTMENT_TYPES } from "@/lib/constants";
import { formatDate, getDaysUntil, getErrorMessage, toArray } from "@/lib/utils";
import { useToast } from "@/components/ui/toast-context";

const fallbackDepartmentData = DEPARTMENT_TYPES.map((department, index) => ({
  department,
  count: [18, 12, 9, 16, 22, 14][index],
}));

export default function DashboardPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [expiringCertCount, setExpiringCertCount] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const employeesResult = await employeeService.getEmployees();
      const employeeList = toArray(employeesResult);
      setEmployees(employeeList);

      const leaveRequests = await Promise.allSettled(
        employeeList.map(async (employee) => {
          const result = await leaveService.getLeavesByEmployee(employee.employeeId);
          return toArray(result).map((leave) => ({
            ...leave,
            employeeName: employee.name,
          }));
        }),
      );

      const allLeaves = leaveRequests
        .filter((item) => item.status === "fulfilled")
        .flatMap((item) => item.value)
        .filter(Boolean);

      const pending = allLeaves.filter((leave) => leave.leaveStatus === "Requested").length;
      setPendingLeaveCount(pending);

      const latestLeaveRequests = allLeaves
        .sort(
          (a, b) =>
            new Date(b.requestDate || b.startDate).getTime() -
            new Date(a.requestDate || a.startDate).getTime(),
        )
        .slice(0, 6);
      setRecentLeaves(latestLeaveRequests);

      const certificationRequests = await Promise.allSettled(
        employeeList.map(async (employee) => {
          const result = await certificationService.getCertificationsByEmployee(employee.employeeId);
          return toArray(result);
        }),
      );

      const allCertifications = certificationRequests
        .filter((item) => item.status === "fulfilled")
        .flatMap((item) => item.value)
        .filter(Boolean);

      const expiringIn30Days = allCertifications.filter((certification) => {
        const days = getDaysUntil(certification.expiryDate);
        return days !== null && days >= 0 && days <= 30;
      }).length;

      setExpiringCertCount(expiringIn30Days);
    } catch (error) {
      addToast({
        type: "error",
        title: "Dashboard load failed",
        description: getErrorMessage(error, "Could not load dashboard data"),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const departmentOverview = useMemo(() => {
    if (!employees.length) return fallbackDepartmentData;

    const map = employees.reduce((acc, employee) => {
      const key = employee.departmentType || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(map).map(([department, count]) => ({ department, count }));
  }, [employees]);

  const maxDepartmentCount = Math.max(...departmentOverview.map((item) => item.count), 1);

  const leaveColumns = [
    {
      key: "employee",
      header: "Employee",
      render: (row) => <span className="font-medium text-slate-900">{row.employeeName || "-"}</span>,
    },
    {
      key: "startDate",
      header: "Period",
      render: (row) => (
        <span>
          {formatDate(row.startDate)} - {formatDate(row.endDate)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge value={row.leaveStatus} />,
    },
    {
      key: "reason",
      header: "Reason",
      render: (row) => <span className="line-clamp-1 max-w-[280px] text-slate-700">{row.reason || "-"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Dashboard"
        description="Realtime workforce signals, leave approvals and certification risks."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              title="Total Employees"
              value={employees.length}
              description="Active employee records"
              icon={Users}
              accent="gold"
            />
            <StatCard
              title="Pending Leaves"
              value={pendingLeaveCount}
              description="Awaiting manager action"
              icon={ClipboardClock}
              accent="blue"
            />
            <StatCard
              title="Expiring Certifications"
              value={expiringCertCount}
              description="Expiring in under 30 days"
              icon={AlertTriangle}
              accent="red"
            />
            <StatCard
              title="Compliance Health"
              value={`${Math.max(0, 100 - expiringCertCount * 3)}%`}
              description="Internal compliance score"
              icon={ShieldCheck}
              accent="emerald"
            />
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 card-elevated">
          <h2 className="text-lg font-semibold text-slate-900">Department Overview</h2>
          <p className="mt-1 text-sm text-slate-600">Distribution of employees per department.</p>

          <div className="mt-6 space-y-3">
            {departmentOverview.map((item) => (
              <div key={item.department} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span>{item.department}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[#53a2f6]"
                    style={{ width: `${(item.count / maxDepartmentCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 card-elevated">
          <h2 className="text-lg font-semibold text-slate-900">Leave Request Feed</h2>
          <p className="mt-1 text-sm text-slate-600">Latest leave submissions and status progression.</p>
          <div className="mt-4">
            <DataTable
              columns={leaveColumns}
              data={recentLeaves}
              loading={loading}
              rowKey={(row) => row.id}
              emptyState={
                <EmptyState
                  title="No leave requests found"
                  description="Leave requests will appear once employees submit time-off requests."
                />
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
