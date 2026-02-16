"use client";

import { useCallback, useEffect, useState } from "react";
import catalogService from "@/services/catalogService";
import Pagination from "@/components/Pagination";
import Loader from "@/components/Loader";
import { getPaginationInfo, parseApiError, toArray } from "@/utils/formatters";

export default function SettingsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await catalogService.getDepartments(pageNumber, pageSize);
      const list = toArray(payload);
      const pagination = getPaginationInfo(payload, pageNumber, pageSize);

      setDepartments(list);
      setTotalPages(pagination.totalPages);
    } catch (err) {
      setError(getFriendlyError(parseApiError(err)));
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-600">Catalog Management Example: Departments (paginated).</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      {loading ? (
        <Loader text="Loading departments catalog..." />
      ) : (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Department ID</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.length ? (
                  departments.map((department, index) => (
                    <tr key={department.id || index} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-xs">{department.id || "-"}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{department.name || department.departmentName || "-"}</td>
                      <td className="px-4 py-3">{department.code || department.departmentCode || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="status-badge border-emerald-200 bg-emerald-50 text-emerald-700">Active</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                      No department records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination pageNumber={pageNumber} totalPages={totalPages} onChange={setPageNumber} />
    </section>
  );
}

function getFriendlyError(parsedError) {
  if (parsedError.status === 400) return parsedError.message || "Invalid catalog query.";
  if (parsedError.status === 404) return "Catalog resource not found.";
  if (parsedError.status >= 500) return "Catalog service is temporarily unavailable.";
  return parsedError.message || "Unexpected error";
}
