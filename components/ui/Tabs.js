"use client";

import { cn } from "@/lib/utils";

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {tabs.map((tab) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-[var(--color-primary)] text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
