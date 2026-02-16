"use client";

import { useCallback, useEffect, useState } from "react";
import payrollService from "@/services/payrollService";
import Loader from "@/components/Loader";
import { formatDate, parseApiError, toArray } from "@/utils/formatters";

const initialRun = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
};

export default function PayrollPage() {
  const [form, setForm] = useState(initialRun);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const loadRuns = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await payrollService.getPayrollRuns();
      setRuns(toArray(payload));
    } catch (err) {
      setError(getFriendlyError(parseApiError(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  const onRunPayroll = async (event) => {
    event.preventDefault();
    setRunning(true);
    setError("");

    try {
      await payrollService.runPayroll({
        year: Number(form.year),
        month: Number(form.month),
      });
      await loadRuns();
    } catch (err) {
      setError(getFriendlyError(parseApiError(err)));
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Payroll</h2>
        <p className="text-sm text-slate-600">Run monthly payroll and track payroll processing history.</p>
      </div>

      {error ? <Alert message={error} /> : null}

      <form onSubmit={onRunPayroll} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Year</span>
            <input
              type="number"
              min="2000"
              max="2100"
              value={form.year}
              onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Month</span>
            <input
              type="number"
              min="1"
              max="12"
              value={form.month}
              onChange={(e) => setForm((prev) => ({ ...prev, month: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={running}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {running ? "Running..." : "Run Payroll"}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <Loader text="Loading payroll runs..." />
      ) : (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Run ID</th>
                  <th className="px-4 py-3 font-semibold">Year</th>
                  <th className="px-4 py-3 font-semibold">Month</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {runs.length ? (
                  runs.map((run) => (
                    <tr key={run.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-xs font-medium text-slate-900">{run.id}</td>
                      <td className="px-4 py-3">{run.year}</td>
                      <td className="px-4 py-3">{run.month}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={run.status} />
                      </td>
                      <td className="px-4 py-3">{formatDate(run.createdOnUtc, true)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                      No payroll runs available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status }) {
  const normalized = `${status || "Unknown"}`.toLowerCase();

  if (normalized.includes("complete") || normalized.includes("success")) {
    return <span className="status-badge border-emerald-200 bg-emerald-50 text-emerald-700">{status}</span>;
  }

  if (normalized.includes("failed") || normalized.includes("error")) {
    return <span className="status-badge border-red-200 bg-red-50 text-red-700">{status}</span>;
  }

  return <span className="status-badge border-amber-200 bg-amber-50 text-amber-700">{status}</span>;
}

function Alert({ message }) {
  return <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>;
}

function getFriendlyError(parsedError) {
  if (parsedError.status === 400) return parsedError.message || "Invalid payroll parameters.";
  if (parsedError.status === 404) return "Payroll resource not found.";
  if (parsedError.status >= 500) return "Payroll service is temporarily unavailable.";
  return parsedError.message || "Unexpected error";
}
