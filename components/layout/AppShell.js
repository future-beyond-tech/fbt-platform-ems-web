"use client";

import { useState } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import TopNav from "@/components/navigation/TopNav";
import { cn } from "@/lib/utils";

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app text-slate-900">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div
        className={cn(
          "min-h-screen transition-[margin] duration-300",
          collapsed ? "lg:ml-[84px]" : "lg:ml-[250px]",
        )}
      >
        <TopNav
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          onToggleMobile={() => setMobileOpen((prev) => !prev)}
        />

        <main className="px-4 pb-8 pt-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
