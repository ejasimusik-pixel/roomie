/**
 * Standardized glass panel used for sections, KPIs and cards.
 * Adds soft entrance animation and hover lift.
 */
export default function GlassCard({
  children,
  className = "",
  as: Component = "div",
  hoverable = true,
  testId,
  ...rest
}) {
  return (
    <Component
      data-testid={testId}
      className={`rm-glass rounded-3xl p-6 md:p-7 animate-scale-in transition-all duration-300 ${
        hoverable ? "hover:-translate-y-0.5 hover:shadow-glow" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
