import { useNavigate } from "react-router-dom";
import { Menu, LogOut, Globe } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

/**
 * Top bar shown on mobile only. The desktop equivalent is the Sidebar.
 * Includes a slide-down menu with the same nav items + profile + logout.
 */
export default function TopBar({ items, title }) {
  const [open, setOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    navigate("/login", { replace: true });
  };

  const toggleLang = () => {
    const next = i18n.language?.startsWith("es") ? "en" : "es";
    i18n.changeLanguage(next);
  };

  return (
    <>
      <header
        className="md:hidden sticky top-0 z-30 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3"
        data-testid="topbar"
      >
        <div className="rm-glass-strong rounded-3xl px-4 py-3 flex items-center justify-between">
          <Logo variant="mark" size="sm" />
          <p
            className="text-sm font-semibold text-violet-900 truncate max-w-[55%]"
            data-testid="topbar-title"
          >
            {title}
          </p>
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-xl text-violet-700 hover:bg-white/60 transition-all"
            aria-label="Menu"
            data-testid="topbar-menu-btn"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
          data-testid="topbar-overlay"
        >
          <div
            className="absolute top-3 inset-x-4 rm-glass-strong rounded-3xl p-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 via-violet-500 to-magenta-500 flex items-center justify-center text-white font-bold shadow-pill">
                {profile?.full_name?.charAt(0)?.toUpperCase() || "R"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-violet-900 truncate">
                  {profile?.full_name}
                </p>
                <p className="text-xs text-violet-400 truncate">
                  {profile?.email}
                </p>
              </div>
            </div>

            <nav className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.to}
                    onClick={() => {
                      navigate(item.to);
                      setOpen(false);
                    }}
                    data-testid={`topbar-nav-${item.label.toLowerCase()}`}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-violet-700 hover:bg-white/60 transition-all text-sm font-semibold"
                  >
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/60">
                      <Icon size={18} />
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="rm-divider my-4" />

            <div className="flex gap-2">
              <button
                onClick={toggleLang}
                data-testid="topbar-lang-toggle"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/60 text-violet-700 font-semibold text-sm hover:bg-white/80 transition-all"
              >
                <Globe size={16} />
                {i18n.language?.startsWith("es") ? "EN" : "ES"}
              </button>
              <button
                onClick={handleLogout}
                data-testid="topbar-logout-btn"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-magenta-500/10 text-magenta-600 font-semibold text-sm hover:bg-magenta-500/20 transition-all"
              >
                <LogOut size={16} />
                {t("nav.logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
