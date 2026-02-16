"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";

export default function TopNav({ collapsed, onToggleCollapse, onToggleMobile }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" className="lg:hidden" onClick={onToggleMobile}>
            <Menu size={16} />
          </Button>
          <Button variant="secondary" size="icon" className="hidden lg:inline-flex" onClick={onToggleCollapse}>
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </Button>
          <div className="hidden md:block">
            <Breadcrumbs />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
            <p className="text-xs text-slate-500">Environment</p>
            <p className="text-sm font-semibold text-slate-900">Corporate Admin</p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-2 md:hidden">
        <Breadcrumbs />
      </div>
    </header>
  );
}
