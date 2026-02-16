import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-3xl font-semibold text-slate-900">404</h2>
        <p className="mt-2 text-sm text-slate-600">The page you requested does not exist.</p>
        <div className="mt-6 flex justify-center">
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
