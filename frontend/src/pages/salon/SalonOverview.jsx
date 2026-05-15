import { useTranslation } from "react-i18next";
import { CalendarRange, Wallet, UsersRound, Activity } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";
import GlassCard from "../../components/GlassCard";

export default function SalonOverview() {
  const { t } = useTranslation();
  const { profile } = useAuth();

  const stats = [
    {
      icon: CalendarRange,
      label: t("salon.todayBookings"),
      value: "12",
      hint: "+3 vs ayer",
      accent: "from-magenta-500 to-pink-300",
      testId: "salon-stat-bookings",
    },
    {
      icon: Wallet,
      label: t("salon.revenue"),
      value: "$48.2k",
      hint: "+18% MoM",
      accent: "from-sky-400 to-violet-500",
      testId: "salon-stat-revenue",
    },
    {
      icon: UsersRound,
      label: t("salon.newClients"),
      value: "27",
      hint: "este mes",
      accent: "from-violet-500 to-magenta-500",
      testId: "salon-stat-clients",
    },
    {
      icon: Activity,
      label: t("salon.occupancy"),
      value: "82%",
      hint: "promedio semanal",
      accent: "from-sky-400 to-magenta-500",
      testId: "salon-stat-occupancy",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="salon-overview">
      <header className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest">
            {t("salon.workspace")}
          </p>
          <span className="rm-chip" data-testid="salon-preview-chip">
            Vista previa
          </span>
        </div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-violet-900 tracking-tight break-words">
          {profile?.full_name?.split(" ")[0] || "Tu salón"} ·{" "}
          <span className="rm-text-gradient">{t("salon.today")}</span>
        </h1>
        <p className="text-violet-500 text-sm">
          Métricas de muestra. Se conectarán a tu agenda real en la próxima fase.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2" testId="salon-upcoming">
          <h2 className="font-display font-bold text-xl text-violet-900 mb-4">
            {t("salon.upcoming")}
          </h2>
          <ul className="space-y-3">
            {[
              { t: "09:30", c: "Sofía M.", s: "Balayage", d: "120 min" },
              { t: "11:00", c: "Camila R.", s: "Manicura premium", d: "60 min" },
              { t: "13:30", c: "Valeria T.", s: "Facial luxe", d: "90 min" },
              { t: "16:00", c: "Andrea P.", s: "Brow lamination", d: "45 min" },
            ].map((row) => (
              <li
                key={row.t}
                className="flex items-center gap-3 sm:gap-4 p-3 rounded-2xl bg-white/40 hover:bg-white/70 transition-colors"
              >
                <div className="w-12 sm:w-14 text-center flex-shrink-0">
                  <p className="text-sm font-bold text-violet-900">{row.t}</p>
                  <p className="text-[10px] uppercase tracking-widest text-violet-400">
                    Hoy
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-violet-900 truncate">{row.c}</p>
                  <p className="text-sm text-violet-500 truncate">{row.s}</p>
                </div>
                <span className="rm-chip hidden sm:inline-flex flex-shrink-0">
                  {row.d}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard testId="salon-quick-actions">
          <h3 className="font-display font-bold text-lg text-violet-900 mb-3">
            Atajos
          </h3>
          <div className="space-y-2.5">
            {[
              t("salon.manageServices"),
              t("salon.manageTeam"),
              t("nav.clients"),
            ].map((label) => (
              <button
                key={label}
                className="w-full text-left px-4 py-3 rounded-2xl bg-white/50 hover:bg-white/80 text-sm font-semibold text-violet-700 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
