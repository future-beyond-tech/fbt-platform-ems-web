"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/tables/DataTable";
import StatusBadge from "@/components/badges/StatusBadge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import EmptyState from "@/components/ui/EmptyState";
import { LEAVE_STATUSES } from "@/lib/constants";
import { formatDate, getErrorMessage, toArray } from "@/lib/utils";
import employeeService from "@/services/employeeService";
import leaveService from "@/services/leaveService";
import { useToast } from "@/components/ui/toast-context";

export default function LeavesPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const employeesResult = await employeeService.getEmployees();
      const employees = toArray(employeesResult);

      const leaveResults = await Promise.allSettled(
        employees.map(async (employee) => {
          const leavesResult = await leaveService.getLeavesByEmployee(employee.employeeId);
          return toArray(leavesResult).map((leave) => ({
            ...leave,
            employeeName: employee.name,
            departmentType: employee.departmentType,
          }));
        }),
      );

      const data = leaveResults
        .filter((item) => item.status === "fulfilled")
        .flatMap((item) => item.value)
        .sort((a, b) => new Date(b.requestDate || b.startDate) - new Date(a.requestDate || a.startDate));

      setRows(data);
    } catch (error) {
      addToast({
        type: "error",
        title: "Leaves load failed",
        description: getErrorMessage(error, "Unable to fetch leave records"),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const searchMatch =
        row.employeeName?.toLowerCase().includes(search.toLowerCase().trim()) ||
        row.reason?.toLowerCase().includes(search.toLowerCase().trim());
      const statusMatch = statusFilter === "All" || row.leaveStatus === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [rows, search, statusFilter]);

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
      key: "period",
      header: "Leave Period",
      render: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
    },
    {
      key: "requested",
      header: "Requested On",
      render: (row) => formatDate(row.requestDate || row.startDate),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge value={row.leaveStatus} />,
    },
    {
      key: "reason",
      header: "Reason",
      render: (row) => <span className="line-clamp-1 max-w-[280px]">{row.reason}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description="Track, audit and monitor leave requests across all departments."
      />

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px]">
        <Input placeholder="Search by employee or reason" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {LEAVE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        rowKey={(row) => row.id}
        loading={loading}
        emptyState={
          <EmptyState
            title="No leave records"
            description="No leave data matches current filters or requests are not yet created."
          />
        }
      />
    </div>
  );
}
