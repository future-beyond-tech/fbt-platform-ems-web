"use client";

import { useState } from "react";
import attendanceService from "@/services/attendanceService";
import Loader from "@/components/Loader";
import { formatDate, formatHours, parseApiError, toArray } from "@/utils/formatters";

export default function AttendancePage() {
  const [employeeId, setEmployeeId] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onCheckIn = async () => {
    setSubmitting(true);
    setError("");

    try {
      await attendanceService.checkIn(employeeId ? { employeeId } : {});
      if (employeeId) {
        await loadHistory();
      }
    } catch (err) {
      setError(getFriendlyError(parseApiError(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const onCheckOut = async () => {
    setSubmitting(true);
    setError("");

    try {
      await attendanceService.checkOut(employeeId ? { employeeId } : {});
      if (employeeId) {
        await loadHistory();
      }
    } catch (err) {
      setError(getFriendlyError(parseApiError(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const loadHistory = async () => {
    if (!employeeId.trim()) {
      setError("Employee ID is required to fetch attendance history.");
      return;
    }

    setLoadingHistory(true);
    setError("");

    try {
      const payload = await attendanceService.getEmployeeAttendance(employeeId.trim());
      setHistory(toArray(payload));
    } catch (err) {
      setError(getFriendlyError(parseApiError(err)));
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Attendance</h2>
        <p className="text-sm text-slate-600">Track employee check-in, check-out and worked hours.</p>
      </div>

      {error ? <Alert message={error} /> : null}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Employee ID</span>
            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="GUID"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
            />
          </label>

          <button
            onClick={onCheckIn}
            disabled={submitting}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Check In
          </button>

          <button
            onClick={onCheckOut}
            disabled={submitting}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            Check Out
          </button>

          <button
            onClick={loadHistory}
            disabled={loadingHistory}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Load History
          </button>
        </div>
      </div>

      {loadingHistory ? (
        <Loader text="Loading attendance history..." />
      ) : (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Work Date</th>
                  <th className="px-4 py-3 font-semibold">Check In</th>
                  <th className="px-4 py-3 font-semibold">Check Out</th>
                  <th className="px-4 py-3 font-semibold">Worked Hours</th>
                </tr>
              </thead>
              <tbody>
                {history.length ? (
                  history.map((record) => (
                    <tr key={record.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">{formatDate(record.workDate)}</td>
                      <td className="px-4 py-3">{formatDate(record.checkInUtc, true)}</td>
                      <td className="px-4 py-3">{formatDate(record.checkOutUtc, true)}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{formatHours(record.workedHours)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                      No attendance records.
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

function Alert({ message }) {
  return <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>;
}

function getFriendlyError(parsedError) {
  if (parsedError.status === 400) return parsedError.message || "Invalid attendance request.";
  if (parsedError.status === 404) return "Attendance record or employee was not found.";
  if (parsedError.status >= 500) return "Attendance service is temporarily unavailable.";
  return parsedError.message || "Unexpected error";
}
