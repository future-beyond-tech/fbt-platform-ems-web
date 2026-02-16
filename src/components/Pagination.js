export default function Pagination({ pageNumber, totalPages, onChange }) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-sm text-slate-600">
        Page <span className="font-semibold text-slate-900">{pageNumber}</span> of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          onClick={() => onChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
        >
          Previous
        </button>
        <button
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          onClick={() => onChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
