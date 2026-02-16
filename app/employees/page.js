"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import DataTable from "@/components/tables/DataTable";
import Pagination from "@/components/ui/Pagination";
import StatusBadge from "@/components/badges/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import AddEmployeeModal from "@/components/modals/AddEmployeeModal";
import EditEmployeeDrawer from "@/components/drawers/EditEmployeeDrawer";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import { DEPARTMENT_TYPES, PAGE_SIZE } from "@/lib/constants";
import { getErrorMessage, toArray } from "@/lib/utils";
import employeeService from "@/services/employeeService";
import { useToast } from "@/components/ui/toast-context";

export default function EmployeesPage() {
  const { addToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [page, setPage] = useState(1);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const result = await employeeService.getEmployees();
      setEmployees(toArray(result));
    } catch (error) {
      addToast({
        type: "error",
        title: "Failed to load employees",
        description: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchMatch = employee.name?.toLowerCase().includes(search.toLowerCase().trim());
      const departmentMatch = departmentFilter === "All" || employee.departmentType === departmentFilter;
      return searchMatch && departmentMatch;
    });
  }, [departmentFilter, employees, search]);

  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredEmployees.slice(start, start + PAGE_SIZE);
  }, [filteredEmployees, page]);

  useEffect(() => {
    setPage(1);
  }, [search, departmentFilter]);

  const handleCreateEmployee = async (values) => {
    setSaving(true);
    try {
      const created = await employeeService.createEmployee(values);

      if (created?.employeeId) {
        setEmployees((prev) => [created, ...prev]);
      } else {
        await fetchEmployees();
      }

      addToast({
        type: "success",
        title: "Employee created",
        description: `${values.name} has been added successfully.`,
      });
      setAddModalOpen(false);
    } catch (error) {
      addToast({
        type: "error",
        title: "Create failed",
        description: getErrorMessage(error, "Unable to create employee"),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmployee = async (values) => {
    if (!editingEmployee) return;

    setSaving(true);
    try {
      const updated = await employeeService.updateEmployee(editingEmployee.employeeId, {
        ...editingEmployee,
        ...values,
      });

      setEmployees((prev) =>
        prev.map((employee) =>
          employee.employeeId === editingEmployee.employeeId ? { ...employee, ...values, ...updated } : employee,
        ),
      );

      addToast({
        type: "success",
        title: "Employee updated",
        description: `${values.name} has been updated.`,
      });
      setEditingEmployee(null);
    } catch (error) {
      addToast({
        type: "error",
        title: "Update failed",
        description: getErrorMessage(error, "Unable to update employee"),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    const snapshot = employees;
    setDeleting(true);

    setEmployees((prev) => prev.filter((employee) => employee.employeeId !== deletingEmployee.employeeId));
    setDeletingEmployee(null);

    try {
      await employeeService.deleteEmployee(deletingEmployee.employeeId);
      addToast({
        type: "success",
        title: "Employee removed",
        description: `${deletingEmployee.name} was removed successfully.`,
      });
    } catch (error) {
      setEmployees(snapshot);
      addToast({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(error, "Could not remove employee"),
      });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Employee",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.employeeId || "Pending Id"}</p>
        </div>
      ),
    },
    {
      key: "employeeType",
      header: "Type",
      render: (row) => <StatusBadge value={row.employeeType} />,
    },
    {
      key: "departmentType",
      header: "Department",
      render: (row) => row.departmentType || "-",
    },
    {
      key: "email",
      header: "Email",
      render: (row) => row.personalDetails?.email || "-",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Link href={`/employees/${row.employeeId}`}>
            <Button variant="secondary" size="sm">
              View
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={() => setEditingEmployee(row)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeletingEmployee(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage all employee records, department assignments and profile lifecycles."
        actions={
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus size={16} />
            Add Employee
          </Button>
        }
      />

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <Input
            className="pl-9"
            placeholder="Search employees by name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <Select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
          <option value="All">All Departments</option>
          {DEPARTMENT_TYPES.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </Select>
      </section>

      <DataTable
        columns={columns}
        data={paginatedEmployees}
        rowKey={(row) => row.employeeId}
        loading={loading}
        emptyState={
          <EmptyState
            title="No employees found"
            description="Try adjusting filters, or add a new employee to start building your workforce records."
            action={
              <Button onClick={() => setAddModalOpen(true)}>
                <Plus size={16} />
                Add First Employee
              </Button>
            }
          />
        }
      />

      {!loading && filteredEmployees.length > PAGE_SIZE ? (
        <Pagination page={page} pageSize={PAGE_SIZE} total={filteredEmployees.length} onPageChange={setPage} />
      ) : null}

      <AddEmployeeModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateEmployee}
        submitting={saving}
      />

      <EditEmployeeDrawer
        open={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        employee={editingEmployee}
        onSubmit={handleUpdateEmployee}
        submitting={saving}
      />

      <ConfirmDialog
        open={Boolean(deletingEmployee)}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={handleDeleteEmployee}
        title="Delete Employee"
        description={`Are you sure you want to delete ${deletingEmployee?.name || "this employee"}?`}
        confirmLabel="Delete Employee"
        loading={deleting}
      />
    </div>
  );
}
