/**
 * Reusable empty-state block. Used wherever a section has no data yet —
 * keeps the luxury aesthetic instead of showing an awkward blank.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  onAction,
  testId,
  className = "",
}) {
  return (
    <div
      className={`rm-glass rounded-3xl p-8 text-center flex flex-col items-center ${className}`}
      data-testid={testId}
    >
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-br from-sky-400 via-violet-500 to-magenta-500 text-white shadow-glow mb-4">
        {Icon ? <Icon size={22} /> : null}
      </span>
      <h3 className="font-display font-bold text-lg text-violet-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-violet-500 text-sm max-w-xs">{description}</p>
      )}
      {cta && (
        <button
          onClick={onAction}
          className="rm-btn-ghost mt-5 text-sm"
          data-testid={testId ? `${testId}-cta` : undefined}
        >
          {cta}
        </button>
      )}
    </div>
  );
}
