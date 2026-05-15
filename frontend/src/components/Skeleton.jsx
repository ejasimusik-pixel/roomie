/**
 * Shimmer skeleton used as a loading placeholder. Variants:
 *   - line  → single row (default)
 *   - card  → rounded card placeholder
 *   - chip  → small pill
 */
export default function Skeleton({ variant = "line", className = "", count = 1 }) {
  const base =
    "block bg-gradient-to-r from-violet-100/70 via-white/50 to-violet-100/70 bg-[length:200%_100%] animate-shimmer rounded-xl";
  const variants = {
    line: "h-4 w-full",
    card: "h-32 w-full rounded-3xl",
    chip: "h-5 w-20 rounded-full",
    title: "h-7 w-2/3",
  };
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`${base} ${variants[variant] || variants.line}`} />
      ))}
    </div>
  );
}
