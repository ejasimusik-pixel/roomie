import { NavLink, useLocation } from "react-router-dom";

/**
 * Mobile-first bottom navigation. Renders only on small screens.
 * `items` must be an array of: { to, label, icon: React.Component }
 */
export default function BottomNav({ items, testId = "bottom-nav" }) {
  const location = useLocation();
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2"
      data-testid={testId}
    >
      <div className="rm-glass-strong rounded-3xl px-3 py-2.5 flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to + "/");
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              data-testid={`${testId}-${item.label.toLowerCase()}`}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "text-magenta-500"
                  : "text-violet-400 hover:text-violet-600"
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-9 h-9 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-magenta-500 to-violet-500 text-white shadow-pill scale-105"
                    : "bg-transparent"
                }`}
              >
                <Icon size={18} />
              </span>
              <span className="text-[10px] font-semibold tracking-wide uppercase">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
