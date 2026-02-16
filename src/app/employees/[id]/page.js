"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Loader from "@/components/Loader";
import employeeService from "@/services/employeeService";
import { parseApiError } from "@/utils/formatters";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEmployee = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      const payload = await employeeService.getEmployeeById(id);
      setEmployee(payload);
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.status === 404) {
        setError("Employee not found.");
      } else if (parsed.status >= 500) {
        setError("Server error occurred while loading employee details.");
      } else {
        setError(parsed.message || "Unable to load employee details.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEmployee();
  }, [loadEmployee]);

  if (loading) return <Loader text="Loading employee details..." />;

  return (
    <section className="space-y-5">
      <Link href="/employees" className="inline-block text-sm font-medium text-blue-700 hover:underline">
        ← Back to Employees
      </Link>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      {employee ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">{employee.name}</h2>
          <p className="mt-1 text-sm text-slate-500">Employee ID: {employee.id}</p>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Employee Type</dt>
              <dd className="mt-1 text-base font-medium text-slate-900">{employee.employeeType}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Department Type</dt>
              <dd className="mt-1 text-base font-medium text-slate-900">{employee.departmentType}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </section>
  );
}
