import { cn } from "@/lib/utils";

export default function StatCard({ title, value, description, accent = "gold", icon: Icon }) {
  const accentClass = {
    gold: "from-[var(--color-primary-soft)] to-transparent",
    blue: "from-blue-100 to-transparent",
    emerald: "from-emerald-100 to-transparent",
    red: "from-red-100 to-transparent",
  }[accent];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", accentClass)} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-sm text-slate-600">{title}</p>
          {Icon ? <Icon size={18} className="text-[var(--color-primary)]" /> : null}
        </div>
        <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        {description ? <p className="mt-2 text-xs text-slate-500">{description}</p> : null}
      </div>
    </div>
  );
}
