import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import { Sparkles } from "lucide-react";

/**
 * Desktop sidebar (hidden on mobile). Pure presentation; receives its links
 * via the `items` prop so it stays reusable across roles.
 */
export default function Sidebar({ items, testId = "sidebar" }) {
  const { t } = useTranslation();
  const { profile, signOut, role, salonPlan, clientPlan } = useAuth();
  const navigate = useNavigate();

  const currentPlan = role === 'client' ? clientPlan : salonPlan;

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className="hidden md:flex md:flex-col md:w-72 md:fixed md:inset-y-0 p-5 z-30"
      data-testid={testId}
    >
      <div className="rm-glass-strong rounded-3xl flex flex-col h-full p-6">
        <div className="mb-8">
          <Logo size="md" />
          <p className="mt-1 ml-12 text-xs uppercase tracking-[0.18em] text-violet-400 font-semibold">
            Personal Care
          </p>
        </div>

        <nav className="flex-1 space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                data-testid={`${testId}-${item.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-magenta-500/10 via-violet-500/10 to-sky-400/10 text-violet-900 shadow-soft"
                      : "text-violet-500 hover:text-violet-900 hover:bg-white/40"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                        isActive
                          ? "bg-gradient-to-br from-magenta-500 to-violet-500 text-white shadow-pill"
                          : "bg-white/60 text-violet-500"
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="rm-divider my-4" />

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/40">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 via-violet-500 to-magenta-500 flex items-center justify-center text-white font-bold text-sm shadow-pill">
            {profile?.full_name?.charAt(0)?.toUpperCase() || "R"}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold text-violet-900 truncate flex items-center gap-2"
              data-testid="sidebar-user-name"
            >
              {profile?.full_name}
              {(currentPlan === 'pro' || currentPlan === 'premium') && (
                <span className="text-[9px] uppercase tracking-wider bg-gradient-to-r from-magenta-500 to-violet-500 text-white px-1.5 py-0.5 rounded shadow-glow flex items-center gap-0.5">
                  <Sparkles size={8} /> Pro
                </span>
              )}
            </p>
            <p className="text-xs text-violet-400 truncate">{profile?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            data-testid="sidebar-logout-btn"
            className="p-2 rounded-xl text-violet-500 hover:text-magenta-500 hover:bg-white/60 transition-all"
            aria-label={t("nav.logout")}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
