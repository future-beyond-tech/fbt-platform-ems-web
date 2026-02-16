"use client";

import Button from "@/components/ui/Button";

export default function GlobalError({ error, reset }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Application Error</h2>
        <p className="mt-2 text-sm text-slate-700">{error?.message || "Unexpected error occurred."}</p>
        <div className="mt-6 flex justify-center">
          <Button onClick={reset}>Retry</Button>
        </div>
      </div>
    </div>
  );
}
