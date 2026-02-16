"use client";

import { useCallback, useEffect, useState } from "react";
import approvalService from "@/services/approvalService";
import Pagination from "@/components/Pagination";
import Loader from "@/components/Loader";
import { formatDate, getPaginationInfo, parseApiError, toArray } from "@/utils/formatters";

const initialForm = {
  module: "payroll",
  referenceId: "",
  level: 1,
  currentApproverId: "",
};

export default function ApprovalsPage() {
  const [form, setForm] = useState(initialForm);
  const [approvals, setApprovals] = useState([]);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await approvalService.getApprovals(pageNumber, pageSize);
      const list = toArray(payload);
      const pagination = getPaginationInfo(payload, pageNumber, pageSize);

      setApprovals(list);
      setTotalPages(pagination.totalPages);
    } catch (err) {
      setError(getFriendlyError(parseApiError(err)));
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize]);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const onSubmitApproval = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await approvalService.submitApproval({
        ...form,
        level: Number(form.level),
      });

      setForm(initialForm);
      await loadApprovals();
    } catch (err) {
      setError(getFriendlyError(parseApiError(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const transition = async (id, status) => {
    setError("");

    try {
      await approvalService.transitionApproval(id, {
        status,
      });
      await loadApprovals();
    } catch (err) {
      setError(getFriendlyError(parseApiError(err)));
    }
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Approvals</h2>
        <p className="text-sm text-slate-600">Submit approval requests and manage approval transitions.</p>
      </div>

      {error ? <Alert message={error} /> : null}

      <form onSubmit={onSubmitApproval} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Submit Approval Request</h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Module</span>
            <select
              value={form.module}
              onChange={(e) => setForm((prev) => ({ ...prev, module: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
            >
              <option value="payroll">Payroll</option>
              <option value="employee">Employee</option>
              <option value="attendance">Attendance</option>
              <option value="compliance">Compliance</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Reference ID</span>
            <input
              required
              value={form.referenceId}
              onChange={(e) => setForm((prev) => ({ ...prev, referenceId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              placeholder="Entity reference"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Level</span>
            <input
              type="number"
              min="1"
              value={form.level}
              onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Approver ID</span>
            <input
              value={form.currentApproverId}
              onChange={(e) => setForm((prev) => ({ ...prev, currentApproverId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              placeholder="User ID"
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Approval"}
          </button>
        </div>
      </form>

      {loading ? (
        <Loader text="Loading approvals..." />
      ) : (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Module</th>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Level</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Requested By</th>
                  <th className="px-4 py-3 font-semibold">Requested On</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.length ? (
                  approvals.map((item) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.module}</td>
                      <td className="px-4 py-3 text-xs">{item.referenceId}</td>
                      <td className="px-4 py-3">L{item.level}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">{item.requestedBy || "-"}</td>
                      <td className="px-4 py-3">{formatDate(item.requestedOnUtc, true)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => transition(item.id, "Approved")}
                            className="rounded-md border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => transition(item.id, "Rejected")}
                            className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      No approval requests.
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

function StatusBadge({ status }) {
  const normalized = `${status || "Unknown"}`.toLowerCase();

  if (normalized.includes("approved")) {
    return <span className="status-badge border-emerald-200 bg-emerald-50 text-emerald-700">{status}</span>;
  }

  if (normalized.includes("reject")) {
    return <span className="status-badge border-red-200 bg-red-50 text-red-700">{status}</span>;
  }

  return <span className="status-badge border-amber-200 bg-amber-50 text-amber-700">{status}</span>;
}

function Alert({ message }) {
  return <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>;
}

function getFriendlyError(parsedError) {
  if (parsedError.status === 400) return parsedError.message || "Invalid approval request.";
  if (parsedError.status === 404) return "Approval resource was not found.";
  if (parsedError.status >= 500) return "Approval workflow service is unavailable.";
  return parsedError.message || "Unexpected error";
}
