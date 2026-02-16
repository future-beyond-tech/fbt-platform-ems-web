"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BriefcaseBusiness, ClipboardList, FileText, LayoutDashboard, Users } from "lucide-react";
import { APP_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = {
  Dashboard: LayoutDashboard,
  Employees: Users,
  Leaves: ClipboardList,
  Certifications: BriefcaseBusiness,
  Reports: FileText,
};

export default function Sidebar({ collapsed, mobileOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 border-r border-slate-200 bg-white px-3 py-4 shadow-sm transition-transform duration-300 lg:translate-x-0",
          collapsed ? "w-[84px]" : "w-[250px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
            <BarChart3 size={16} />
          </span>
          {!collapsed ? (
            <div>
              <p className="text-sm font-semibold text-slate-900">FBT EMS</p>
              <p className="text-[11px] text-slate-500">Admin Console</p>
            </div>
          ) : null}
        </div>

        <nav className="space-y-2">
          {APP_NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = icons[item.label] || LayoutDashboard;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
                onClick={onClose}
              >
                <Icon size={18} />
                {!collapsed ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      {mobileOpen ? (
        <button
          className="fixed inset-0 z-30 bg-slate-900/25 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      ) : null}
    </>
  );
}
