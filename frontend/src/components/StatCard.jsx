/**
 * Small KPI block used across dashboards.
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "from-magenta-500 to-violet-500",
  testId,
}) {
  return (
    <div
      className="rm-glass rounded-3xl p-5 animate-slide-up"
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold">
            {label}
          </p>
          <p className="mt-2 text-3xl font-extrabold text-violet-900">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-violet-500 font-medium">{hint}</p>
          )}
        </div>
        {Icon && (
          <span
            className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl text-white shadow-pill bg-gradient-to-br ${accent}`}
          >
            <Icon size={20} />
          </span>
        )}
      </div>
    </div>
  );
}
