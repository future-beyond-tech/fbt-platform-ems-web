export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-slate-600">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
