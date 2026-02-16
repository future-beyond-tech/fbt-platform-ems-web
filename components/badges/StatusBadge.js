import { cn } from "@/lib/utils";

const styleMap = {
  Requested: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Cancelled: "bg-slate-100 text-slate-700 border-slate-200",
  Expiring: "bg-amber-50 text-amber-700 border-amber-200",
  Expired: "bg-red-50 text-red-700 border-red-200",
  Valid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Permanent: "bg-blue-50 text-blue-700 border-blue-200",
  Temporary: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Retailer: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Intern: "bg-purple-50 text-purple-700 border-purple-200",
  default: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function StatusBadge({ value }) {
  const className = styleMap[value] || styleMap.default;

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", className)}>
      {value || "Unknown"}
    </span>
  );
}
