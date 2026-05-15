import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Reusable luxury-minimal modal. Locks body scroll, closes on backdrop click
 * and Escape, renders a glass panel centered on the screen (or as a bottom
 * sheet on mobile when `sheet` is true).
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  testId,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4 py-0 sm:py-8 animate-fade-in"
      data-testid={testId}
    >
      <div
        className="absolute inset-0 bg-violet-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative w-full ${widths[size] || widths.md} max-h-[95vh] flex flex-col rm-glass-strong rounded-t-[2rem] sm:rounded-[2rem] shadow-glow animate-slide-up overflow-hidden`}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start gap-4 p-5 sm:p-6 border-b border-white/40">
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className="font-display font-extrabold text-xl text-violet-900 truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-violet-500 text-sm">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid={testId ? `${testId}-close` : "modal-close"}
            className="p-2 rounded-full text-violet-500 hover:text-magenta-500 hover:bg-white/60 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
          {children}
        </div>

        {footer && (
          <footer className="px-5 sm:px-6 py-4 border-t border-white/40 bg-white/30 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
