/**
 * Shimmer skeleton used as a luxury loading placeholder. Variants:
 *   - line  → single row (default)
 *   - card  → rounded card placeholder
 *   - chip  → small pill
 *   - title → subtitle row
 *   - avatar → circular thumbnail
 *
 * Accepts an optional `label` prop to surface an emotional micro-copy line
 * beneath the shimmer (e.g. "Roomie está preparando tu vista…").
 */
export default function Skeleton({ variant = "line", className = "", count = 1, label }) {
  const base =
    "block bg-gradient-to-r from-violet-100/70 via-white/50 to-violet-100/70 bg-[length:200%_100%] animate-shimmer rounded-xl";
  const variants = {
    line: "h-4 w-full",
    card: "h-32 w-full rounded-3xl",
    chip: "h-5 w-20 rounded-full",
    title: "h-7 w-2/3",
    avatar: "h-12 w-12 rounded-full",
  };
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true" data-testid="skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`${base} ${variants[variant] || variants.line}`} />
      ))}
      {label && (
        <p className="text-[11px] uppercase tracking-[0.2em] text-violet-400/80 font-bold pt-2 text-center">
          {label}
        </p>
      )}
    </div>
  );
}
