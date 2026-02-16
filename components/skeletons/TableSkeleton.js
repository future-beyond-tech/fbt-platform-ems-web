export default function TableSkeleton({ columns = 5, rows = 5 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="animate-pulse">
        <div
          className="grid gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-3 w-20 rounded bg-slate-200" />
          ))}
        </div>
        <div className="space-y-3 px-4 py-4">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 rounded bg-slate-200" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
