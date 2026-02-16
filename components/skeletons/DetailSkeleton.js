export default function DetailSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-52 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-40 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
