"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, Landmark } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import employeeService from "@/services/employeeService";
import qualificationService from "@/services/qualificationService";
import experienceService from "@/services/experienceService";
import salaryService from "@/services/salaryService";
import reportService from "@/services/reportService";
import { formatCurrency, getErrorMessage, toArray } from "@/lib/utils";
import { useToast } from "@/components/ui/toast-context";

export default function ReportsPage() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [reportGroups, setReportGroups] = useState([]);
  const [exporting, setExporting] = useState(false);

  const fetchReportData = useCallback(async () => {
    setLoading(true);

    try {
      const remoteReport = await reportService.getReportData();
      const normalizedRemoteGroups = normalizeRemoteReport(remoteReport);

      if (normalizedRemoteGroups.length) {
        setReportGroups(normalizedRemoteGroups);
        setLoading(false);
        return;
      }

      const employeesResult = await employeeService.getEmployees();
      const employees = toArray(employeesResult);

      const enrichedEmployeeRecords = await Promise.all(
        employees.map(async (employee) => {
          const [qualificationsResult, experiencesResult, salaryResult] = await Promise.allSettled([
            qualificationService.getQualificationsByEmployee(employee.employeeId),
            experienceService.getExperiencesByEmployee(employee.employeeId),
            salaryService.getSalaryByEmployee(employee.employeeId),
          ]);

          return {
            ...employee,
            qualifications:
              qualificationsResult.status === "fulfilled" ? toArray(qualificationsResult.value) : [],
            experiences: experiencesResult.status === "fulfilled" ? toArray(experiencesResult.value) : [],
            employeeSalary: salaryResult.status === "fulfilled" ? salaryResult.value : null,
          };
        }),
      );

      const grouped = enrichedEmployeeRecords.reduce((acc, employee) => {
        const department = employee.departmentType || "Unassigned";

        if (!acc[department]) {
          acc[department] = [];
        }

        acc[department].push(employee);
        return acc;
      }, {});

      const groups = Object.entries(grouped).map(([department, employeesInDepartment]) => ({
        department,
        employees: employeesInDepartment,
      }));

      setReportGroups(groups);
    } catch (error) {
      addToast({
        type: "error",
        title: "Report load failed",
        description: getErrorMessage(error, "Unable to load report data"),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const grandSummary = useMemo(() => {
    const allEmployees = reportGroups.flatMap((group) => group.employees);

    const totalNetSalary = allEmployees.reduce(
      (sum, employee) => sum + (employee.employeeSalary?.netSalary || 0),
      0,
    );

    const totalQualifications = allEmployees.reduce(
      (sum, employee) => sum + (employee.qualifications?.length || 0),
      0,
    );

    const totalExperiences = allEmployees.reduce(
      (sum, employee) => sum + (employee.experiences?.length || 0),
      0,
    );

    return {
      employeeCount: allEmployees.length,
      totalNetSalary,
      totalQualifications,
      totalExperiences,
    };
  }, [reportGroups]);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await reportService.generateReport();
      addToast({
        type: "success",
        title: "Report generated",
        description: "Preparing print view for PDF export.",
      });
    } catch {
      addToast({
        type: "info",
        title: "Local export mode",
        description: "Using browser print export as fallback.",
      });
    } finally {
      if (typeof window !== "undefined") {
        window.print();
      }
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Reports"
        description="Department-level workforce summaries with salary, qualification and experience insights."
        actions={
          <Button onClick={handleExportPdf} disabled={exporting}>
            <Download size={16} />
            {exporting ? "Exporting..." : "Export to PDF"}
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Employees" value={grandSummary.employeeCount} />
        <SummaryCard label="Net Salary" value={formatCurrency(grandSummary.totalNetSalary)} />
        <SummaryCard label="Qualifications" value={grandSummary.totalQualifications} />
        <SummaryCard label="Experience Records" value={grandSummary.totalExperiences} />
      </section>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="h-4 w-44 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-64 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : reportGroups.length ? (
        <section className="space-y-3">
          {reportGroups.map((group) => {
            const departmentSalary = group.employees.reduce(
              (sum, employee) => sum + (employee.employeeSalary?.netSalary || 0),
              0,
            );
            const departmentQualificationCount = group.employees.reduce(
              (sum, employee) => sum + (employee.qualifications?.length || 0),
              0,
            );
            const departmentExperienceCount = group.employees.reduce(
              (sum, employee) => sum + (employee.experiences?.length || 0),
              0,
            );

            return (
              <details key={group.department} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white" open>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{group.department}</h2>
                    <p className="mt-1 text-xs text-slate-600">{group.employees.length} employee(s)</p>
                  </div>
                  <ChevronDown className="text-slate-600 transition group-open:rotate-180" size={18} />
                </summary>

                <div className="border-t border-slate-200 px-5 pb-5 pt-4">
                  <div className="mb-4 grid gap-3 sm:grid-cols-3">
                    <MetricChip label="Department Salary" value={formatCurrency(departmentSalary)} />
                    <MetricChip label="Qualifications" value={departmentQualificationCount} />
                    <MetricChip label="Experiences" value={departmentExperienceCount} />
                  </div>

                  <div className="space-y-2">
                    {group.employees.map((employee) => (
                      <details key={employee.employeeId} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                              <Landmark size={14} />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{employee.name}</p>
                              <p className="text-xs text-slate-500">{employee.employeeType}</p>
                            </div>
                          </div>
                          <ChevronDown className="text-slate-500" size={16} />
                        </summary>

                        <div className="border-t border-slate-200 px-4 py-3">
                          <div className="grid gap-3 text-sm md:grid-cols-3">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <p className="text-xs text-slate-500">Salary Band</p>
                              <p className="mt-1 text-slate-900">{employee.employeeSalary?.band || "-"}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <p className="text-xs text-slate-500">Net Salary</p>
                              <p className="mt-1 text-slate-900">{formatCurrency(employee.employeeSalary?.netSalary || 0)}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <p className="text-xs text-slate-500">Experience Records</p>
                              <p className="mt-1 text-slate-900">{employee.experiences?.length || 0}</p>
                            </div>
                          </div>

                          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Qualifications Summary</p>
                            <p className="mt-1 text-sm text-slate-700">
                              {employee.qualifications?.length
                                ? employee.qualifications.map((item) => item.degree).join(", ")
                                : "No qualification records"}
                            </p>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
        </section>
      ) : (
        <EmptyState
          title="No report data"
          description="No employee records were found to build departmental analytics."
        />
      )}
    </div>
  );
}

function normalizeRemoteReport(payload) {
  const groups = toArray(payload);

  return groups
    .map((group) => {
      const department = group.department || group.departmentType || group.name;
      const employees = toArray(group.employees).map((employee) => ({
        ...employee,
        qualifications: toArray(employee.qualifications),
        experiences: toArray(employee.experiences),
        employeeSalary: employee.employeeSalary || null,
      }));

      return {
        department,
        employees,
      };
    })
    .filter((group) => group.department && group.employees.length);
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function MetricChip({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
