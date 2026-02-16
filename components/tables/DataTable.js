import TableSkeleton from "@/components/skeletons/TableSkeleton";

export default function DataTable({
  columns,
  data,
  rowKey = "id",
  loading = false,
  emptyState,
  className = "",
}) {
  if (loading) {
    return <TableSkeleton columns={columns.length} rows={6} />;
  }

  if (!data?.length) {
    return emptyState || null;
  }

  const resolveKey = (row, index) => {
    if (typeof rowKey === "function") return rowKey(row, index);
    return row[rowKey] || index;
  };

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={resolveKey(row, index)}
                className="border-t border-slate-100 transition hover:bg-slate-50/80"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-middle">
                    {column.render ? column.render(row, index) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
