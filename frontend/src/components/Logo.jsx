import { Link } from "react-router-dom";

/**
 * Roomie wordmark — uses the official gradient (blue → violet → magenta).
 * Variants:
 *   - `mark`   : icon only (the official emoji avatar)
 *   - `full`   : icon + wordmark
 *   - `text`   : wordmark only
 */
export default function Logo({ variant = "full", size = "md", to = "/" }) {
  const sizes = {
    sm: { icon: "w-7 h-7", text: "text-lg" },
    md: { icon: "w-9 h-9", text: "text-2xl" },
    lg: { icon: "w-12 h-12", text: "text-3xl" },
    xl: { icon: "w-16 h-16", text: "text-4xl" },
  };
  const s = sizes[size] || sizes.md;

  const inner = (
    <span
      className="inline-flex items-center gap-2.5 select-none"
      data-testid="roomie-logo"
    >
      {variant !== "text" && (
        <img
          src="/icons/emoji-roomie.jpg"
          alt="Roomie"
          className={`${s.icon} rounded-2xl object-cover shadow-soft`}
          draggable="false"
        />
      )}
      {variant !== "mark" && (
        <span
          className={`font-display font-extrabold tracking-tight rm-text-gradient ${s.text}`}
        >
          Roomie
        </span>
      )}
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center" aria-label="Roomie">
        {inner}
      </Link>
    );
  }
  return inner;
}
