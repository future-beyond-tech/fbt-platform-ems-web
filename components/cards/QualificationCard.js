import { Calendar, GraduationCap, Landmark } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default function QualificationCard({ qualification, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{qualification.degree}</h3>
          <p className="mt-1 text-sm text-slate-500">Grade: {qualification.grade}</p>
        </div>
        <GraduationCap className="text-[var(--color-primary)]" size={18} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-700">
        <p className="flex items-center gap-2">
          <Landmark size={14} className="text-slate-500" />
          {qualification.institution}
        </p>
        <p className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-500" />
          Graduated {formatDate(qualification.graduationDate)}
        </p>
      </div>

      <div className="mt-5 flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => onEdit(qualification)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(qualification)}>
          Delete
        </Button>
      </div>
    </div>
  );
}
