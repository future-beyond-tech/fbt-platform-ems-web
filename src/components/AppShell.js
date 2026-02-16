"use client";

import { usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function AppShell({ navbar, sidebar, children }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (isPublicRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen">
      {navbar}
      <div className="flex min-h-[calc(100vh-64px)]">
        {sidebar}
        <main className="w-full p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
