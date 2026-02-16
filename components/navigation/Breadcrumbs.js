"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pretty = (segment) => segment.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

export default function Breadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((segment, index) => ({
    label: pretty(segment),
    href: `/${segments.slice(0, index + 1).join("/")}`,
  }));

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/dashboard" className="transition hover:text-slate-900">
            Home
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-2">
            <span className="text-slate-400">/</span>
            <Link href={crumb.href} className="transition hover:text-slate-900">
              {crumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
