"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import Loader from "@/components/Loader";
import employeeService from "@/services/employeeService";
import { getPaginationInfo, parseApiError, toArray } from "@/utils/formatters";

const defaultForm = {
  name: "",
  employeeType: "Permanent",
  departmentType: "IT",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState(defaultForm);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await employeeService.getEmployees(pageNumber, pageSize);
      const list = toArray(payload);
      const pagination = getPaginationInfo(payload, pageNumber, pageSize);

      setEmployees(list);
      setTotalPages(pagination.totalPages);
    } catch (err) {
      setError(getFriendlyError(parseApiError(err)));
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const sortedEmployees = useMemo(() => {
    const cloned = [...employees];
    cloned.sort((a, b) => {
      const left = `${a?.[sortBy] || ""}`.toLowerCase();
      const right = `${b?.[sortBy] || ""}`.toLowerCase();

      if (left < right) return sortOrder === "asc" ? -1 : 1;
      if (left > right) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return cloned;
  }, [employees, sortBy, sortOrder]);

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(column);
    setSortOrder("asc");
  };

  const onCreate = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setFormError("Employee name is required");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      await employeeService.createEmployee(form);
      setCreateOpen(false);
      setForm(defaultForm);
      await loadEmployees();
    } catch (err) {
      setFormError(getFriendlyError(parseApiError(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (employee) => {
    setSelectedEmployee(employee);
    setForm({
      name: employee.name || "",
      employeeType: employee.employeeType || "Permanent",
      departmentType: employee.departmentType || "IT",
    });
    setFormError("");
    setEditOpen(true);
  };

  const onEdit = async (event) => {
    event.preventDefault();
    if (!selectedEmployee) return;

    setSubmitting(true);
    setFormError("");

    try {
      await employeeService.updateEmployee(selectedEmployee.id, {
        ...selectedEmployee,
        ...form,
      });

      setEditOpen(false);
      setSelectedEmployee(null);
      await loadEmployees();
    } catch (err) {
      setFormError(getFriendlyError(parseApiError(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const openDelete = (employee) => {
    setSelectedEmployee(employee);
    setDeleteOpen(true);
  };

  const onDelete = async () => {
    if (!selectedEmployee) return;
    setSubmitting(true);

    try {
      await employeeService.deleteEmployee(selectedEmployee.id);
      setDeleteOpen(false);
      setSelectedEmployee(null);
      await loadEmployees();
    } catch (err) {
      setError(getFriendlyError(parseApiError(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Employees</h2>
          <p className="text-sm text-slate-600">Manage employee records with create, update, delete and detail views.</p>
        </div>

        <button
          onClick={() => {
            setForm(defaultForm);
            setFormError("");
            setCreateOpen(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add Employee
        </button>
      </div>

      {error ? <ErrorAlert message={error} /> : null}

      {loading ? (
        <Loader text="Loading employees..." />
      ) : (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <SortableHeader label="Name" column="name" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader
                    label="Employee Type"
                    column="employeeType"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={toggleSort}
                  />
                  <SortableHeader
                    label="Department"
                    column="departmentType"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={toggleSort}
                  />
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployees.map((employee) => (
                  <tr key={employee.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{employee.name}</td>
                    <td className="px-4 py-3">{employee.employeeType}</td>
                    <td className="px-4 py-3">{employee.departmentType}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/employees/${employee.id}`}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => openEdit(employee)}
                          className="rounded-md border border-blue-300 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(employee)}
                          className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination pageNumber={pageNumber} totalPages={totalPages} onChange={setPageNumber} />

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Employee"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Create"}
            </button>
          </div>
        }
      >
        <EmployeeFormFields form={form} setForm={setForm} error={formError} />
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Employee"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onEdit}
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Updating..." : "Update"}
            </button>
          </div>
        }
      >
        <EmployeeFormFields form={form} setForm={setForm} error={formError} />
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Employee"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              disabled={submitting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? "Deleting..." : "Delete"}
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-700">
          Are you sure you want to delete <span className="font-semibold">{selectedEmployee?.name}</span>?
        </p>
      </Modal>
    </section>
  );
}

function SortableHeader({ label, column, sortBy, sortOrder, onSort }) {
  const active = sortBy === column;
  return (
    <th className="px-4 py-3">
      <button
        className="inline-flex items-center gap-1 font-semibold"
        onClick={() => onSort(column)}
      >
        {label}
        <span className="text-[10px] text-slate-400">{active ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}

function EmployeeFormFields({ form, setForm, error }) {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      {error ? <ErrorAlert message={error} /> : null}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
        <input
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
          placeholder="Employee name"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Employee Type</span>
          <select
            value={form.employeeType}
            onChange={(e) => setForm((prev) => ({ ...prev, employeeType: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
          >
            <option>Permanent</option>
            <option>Temporary</option>
            <option>Retailer</option>
            <option>Intern</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Department Type</span>
          <select
            value={form.departmentType}
            onChange={(e) => setForm((prev) => ({ ...prev, departmentType: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
          >
            <option>Administration</option>
            <option>HR</option>
            <option>Finance</option>
            <option>Marketing</option>
            <option>Sales</option>
            <option>IT</option>
          </select>
        </label>
      </div>
    </form>
  );
}

function ErrorAlert({ message }) {
  return <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>;
}

function getFriendlyError(parsedError) {
  if (parsedError.status === 400) return parsedError.message || "Validation failed. Check your input.";
  if (parsedError.status === 404) return "Requested employee resource was not found.";
  if (parsedError.status >= 500) return "Server error occurred. Please try again.";
  return parsedError.message || "Unexpected error";
}
