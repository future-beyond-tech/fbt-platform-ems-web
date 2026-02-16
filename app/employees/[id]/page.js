"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Briefcase, FileText, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import EmptyState from "@/components/ui/EmptyState";
import DetailSkeleton from "@/components/skeletons/DetailSkeleton";
import StatusBadge from "@/components/badges/StatusBadge";
import QualificationCard from "@/components/cards/QualificationCard";
import AddQualificationModal from "@/components/modals/AddQualificationModal";
import EditQualificationDrawer from "@/components/drawers/EditQualificationDrawer";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import DataTable from "@/components/tables/DataTable";
import employeeService from "@/services/employeeService";
import qualificationService from "@/services/qualificationService";
import experienceService from "@/services/experienceService";
import certificationService from "@/services/certificationService";
import documentService from "@/services/documentService";
import leaveService from "@/services/leaveService";
import salaryService from "@/services/salaryService";
import { formatCurrency, formatDate, getDaysUntil, getErrorMessage, toArray } from "@/lib/utils";
import { useToast } from "@/components/ui/toast-context";

const tabItems = [
  { value: "personal", label: "Personal Info" },
  { value: "qualifications", label: "Qualifications" },
  { value: "experience", label: "Experience" },
  { value: "certifications", label: "Certifications" },
  { value: "documents", label: "Government Documents" },
  { value: "leaves", label: "Leave History" },
  { value: "salary", label: "Salary" },
];

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [qualificationLoading, setQualificationLoading] = useState(true);

  const [employee, setEmployee] = useState(null);
  const [qualifications, setQualifications] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [salary, setSalary] = useState(null);

  const [addQualificationOpen, setAddQualificationOpen] = useState(false);
  const [editingQualification, setEditingQualification] = useState(null);
  const [deletingQualification, setDeletingQualification] = useState(null);

  const [savingQualification, setSavingQualification] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [salaryLoading, setSalaryLoading] = useState(false);

  const fetchQualifications = useCallback(async () => {
    if (!id) return;

    setQualificationLoading(true);
    try {
      const qualificationResult = await qualificationService.getQualificationsByEmployee(id);
      setQualifications(toArray(qualificationResult));
    } catch (error) {
      addToast({
        type: "error",
        title: "Qualification load failed",
        description: getErrorMessage(error, "Unable to fetch qualification data"),
      });
    } finally {
      setQualificationLoading(false);
    }
  }, [id, addToast]);

  const fetchEmployeeDetail = useCallback(async () => {
    if (!id) return;

    setLoading(true);

    try {
      const [employeeResult, experienceResult, certificationResult, documentResult, leaveResult, salaryResult] =
        await Promise.allSettled([
          employeeService.getEmployeeById(id),
          experienceService.getExperiencesByEmployee(id),
          certificationService.getCertificationsByEmployee(id),
          documentService.getDocumentsByEmployee(id),
          leaveService.getLeavesByEmployee(id),
          salaryService.getSalaryByEmployee(id),
        ]);

      if (employeeResult.status === "fulfilled") {
        setEmployee(employeeResult.value);
      }

      setExperiences(experienceResult.status === "fulfilled" ? toArray(experienceResult.value) : []);
      setCertifications(certificationResult.status === "fulfilled" ? toArray(certificationResult.value) : []);
      setDocuments(documentResult.status === "fulfilled" ? toArray(documentResult.value) : []);
      setLeaves(leaveResult.status === "fulfilled" ? toArray(leaveResult.value) : []);
      setSalary(salaryResult.status === "fulfilled" ? salaryResult.value : null);

      await fetchQualifications();
    } catch (error) {
      addToast({
        type: "error",
        title: "Employee detail failed",
        description: getErrorMessage(error, "Failed to load employee detail page"),
      });
    } finally {
      setLoading(false);
    }
  }, [id, addToast, fetchQualifications]);

  useEffect(() => {
    fetchEmployeeDetail();
  }, [fetchEmployeeDetail]);

  const handleAddQualification = async (values) => {
    if (!id) return;

    setSavingQualification(true);
    try {
      const payload = {
        ...values,
        graduationDate: new Date(values.graduationDate).toISOString(),
      };

      const created = await qualificationService.createQualification(id, payload);
      if (created?.qualificationId) {
        setQualifications((prev) => [...prev, created]);
      } else {
        await fetchQualifications();
      }
      addToast({
        type: "success",
        title: "Qualification added",
        description: `${values.degree} has been added to the profile.`,
      });
      setAddQualificationOpen(false);
    } catch (error) {
      addToast({
        type: "error",
        title: "Add failed",
        description: getErrorMessage(error, "Unable to add qualification"),
      });
    } finally {
      setSavingQualification(false);
    }
  };

  const handleEditQualification = async (values) => {
    if (!editingQualification) return;

    setSavingQualification(true);
    try {
      const payload = {
        ...editingQualification,
        ...values,
        graduationDate: new Date(values.graduationDate).toISOString(),
      };

      const updated = await qualificationService.updateQualification(
        editingQualification.qualificationId,
        payload,
      );

      setQualifications((prev) =>
        prev.map((qualification) =>
          qualification.qualificationId === editingQualification.qualificationId
            ? {
                ...qualification,
                ...values,
                ...updated,
                graduationDate: payload.graduationDate,
              }
            : qualification,
        ),
      );

      addToast({
        type: "success",
        title: "Qualification updated",
        description: `${values.degree} details were saved.`,
      });
      setEditingQualification(null);
    } catch (error) {
      addToast({
        type: "error",
        title: "Update failed",
        description: getErrorMessage(error, "Unable to update qualification"),
      });
    } finally {
      setSavingQualification(false);
    }
  };

  const handleDeleteQualification = async () => {
    if (!deletingQualification) return;

    const target = deletingQualification;
    const snapshot = qualifications;

    setDeleting(true);
    setQualifications((prev) => prev.filter((item) => item.qualificationId !== target.qualificationId));
    setDeletingQualification(null);

    try {
      await qualificationService.deleteQualification(target.qualificationId);
      addToast({
        type: "success",
        title: "Qualification deleted",
        description: `${target.degree} was removed from this profile.`,
      });
    } catch (error) {
      setQualifications(snapshot);
      addToast({
        type: "error",
        title: "Delete failed",
        description: getErrorMessage(error, "Unable to delete qualification"),
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCalculateSalary = async () => {
    if (!id) return;

    setSalaryLoading(true);
    try {
      const calculated = await salaryService.calculateSalary(id);
      setSalary(calculated);
      addToast({
        type: "success",
        title: "Salary calculated",
        description: "Latest salary package has been refreshed.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Salary calculation failed",
        description: getErrorMessage(error),
      });
    } finally {
      setSalaryLoading(false);
    }
  };

  const leaveColumns = useMemo(
    () => [
      {
        key: "dates",
        header: "Leave Period",
        render: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
      },
      {
        key: "requestDate",
        header: "Requested",
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
        render: (row) => <span className="line-clamp-1 max-w-[340px]">{row.reason}</span>,
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <DetailSkeleton />
      </div>
    );
  }

  if (!employee) {
    return (
      <EmptyState
        title="Employee not found"
        description="This employee record is unavailable or was removed from the system."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.name}
        description={`Employee ID: ${employee.employeeId}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge value={employee.employeeType} />
            <StatusBadge value={employee.departmentType} />
          </div>
        }
      />

      <Tabs tabs={tabItems} value={activeTab} onChange={setActiveTab} />

      <section className="animate-fade-up">
        {activeTab === "personal" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">Identity</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p>
                  <span className="text-slate-500">Name:</span> {employee.name}
                </p>
                <p>
                  <span className="text-slate-500">Employee Type:</span> {employee.employeeType}
                </p>
                <p>
                  <span className="text-slate-500">Department:</span> {employee.departmentType}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">Personal Details</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p>
                  <span className="text-slate-500">Email:</span> {employee.personalDetails?.email || "-"}
                </p>
                <p>
                  <span className="text-slate-500">Phone:</span> {employee.personalDetails?.phoneNumber || "-"}
                </p>
                <p>
                  <span className="text-slate-500">Address:</span> {employee.personalDetails?.address || "-"}
                </p>
                <p>
                  <span className="text-slate-500">Date of Birth:</span>{" "}
                  {formatDate(employee.personalDetails?.dateOfBirth)}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "qualifications" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Educational Qualifications</h3>
              <Button onClick={() => setAddQualificationOpen(true)}>Add Qualification</Button>
            </div>

            {qualificationLoading ? (
              <DetailSkeleton />
            ) : qualifications.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {qualifications.map((qualification) => (
                  <QualificationCard
                    key={qualification.qualificationId}
                    qualification={qualification}
                    onEdit={setEditingQualification}
                    onDelete={setDeletingQualification}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No qualifications added"
                description="Add degree or academic records to complete this employee profile."
                action={<Button onClick={() => setAddQualificationOpen(true)}>Add Qualification</Button>}
              />
            )}
          </div>
        ) : null}

        {activeTab === "experience" ? (
          experiences.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {experiences.map((experience) => (
                <div key={experience.experienceId} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{experience.jobTitle}</h3>
                      <p className="mt-1 text-sm text-slate-600">{experience.companyName}</p>
                    </div>
                    <Briefcase className="text-[var(--color-primary)]" size={16} />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {formatDate(experience.startDate)} -{" "}
                    {experience.endDate ? formatDate(experience.endDate) : "Present"}
                  </p>
                  <p className="mt-3 text-sm text-slate-700">{experience.responsibilities}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No experience records"
              description="Professional history records are not available for this employee yet."
            />
          )
        ) : null}

        {activeTab === "certifications" ? (
          certifications.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {certifications.map((certification) => {
                const daysToExpiry = getDaysUntil(certification.expiryDate);
                const expiringSoon = daysToExpiry !== null && daysToExpiry <= 30;

                return (
                  <div key={certification.certificationId} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{certification.certificationName}</h3>
                        <p className="mt-1 text-sm text-slate-600">{certification.issuingOrganization}</p>
                      </div>
                      <ShieldCheck className="text-[var(--color-primary)]" size={17} />
                    </div>
                    <p className="mt-3 text-sm text-slate-700">Issued {formatDate(certification.issueDate)}</p>
                    <p className="mt-1 text-sm text-slate-700">
                      Expires {certification.expiryDate ? formatDate(certification.expiryDate) : "No expiry"}
                    </p>
                    {expiringSoon ? (
                      <p className="mt-2 text-xs font-medium text-amber-700">Expiring in {daysToExpiry} day(s)</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No certifications found"
              description="Add certifications to track compliance and mandatory credentials."
            />
          )
        ) : null}

        {activeTab === "documents" ? (
          documents.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {documents.map((document) => (
                <div key={document.documentId} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-semibold text-slate-900">{document.documentType}</h3>
                    <FileText className="text-[var(--color-primary)]" size={16} />
                  </div>
                  <p className="mt-2 text-sm text-slate-700">Document No: {document.documentNumber}</p>
                  <p className="mt-2 text-sm text-slate-600">Issued: {formatDate(document.issueDate)}</p>
                  <p className="text-sm text-slate-600">Expiry: {formatDate(document.expiryDate)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No government documents"
              description="Identity document records are not yet uploaded for this employee."
            />
          )
        ) : null}

        {activeTab === "leaves" ? (
          <DataTable
            columns={leaveColumns}
            data={leaves}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                title="No leave history"
                description="No leave requests have been registered for this employee."
              />
            }
          />
        ) : null}

        {activeTab === "salary" ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Salary Summary</h3>
                <p className="mt-1 text-sm text-slate-600">Compensation values fetched from payroll service.</p>
              </div>
              <Button onClick={handleCalculateSalary} disabled={salaryLoading}>
                {salaryLoading ? "Calculating..." : "Recalculate Salary"}
              </Button>
            </div>

            {salary ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Net Salary</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(salary.netSalary)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Band</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{salary.band || "-"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Calculated On</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{formatDate(salary.calculatedOn, true)}</p>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No salary record"
                description="Salary has not been generated for this employee yet."
              />
            )}
          </div>
        ) : null}
      </section>

      <AddQualificationModal
        open={addQualificationOpen}
        onClose={() => setAddQualificationOpen(false)}
        onSubmit={handleAddQualification}
        submitting={savingQualification}
      />

      <EditQualificationDrawer
        open={Boolean(editingQualification)}
        onClose={() => setEditingQualification(null)}
        qualification={editingQualification}
        onSubmit={handleEditQualification}
        submitting={savingQualification}
      />

      <ConfirmDialog
        open={Boolean(deletingQualification)}
        onClose={() => setDeletingQualification(null)}
        onConfirm={handleDeleteQualification}
        loading={deleting}
        title="Delete Qualification"
        description={`Remove ${deletingQualification?.degree || "this qualification"} from this employee profile?`}
        confirmLabel="Delete Qualification"
      />
    </div>
  );
}
