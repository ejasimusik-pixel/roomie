import { useTranslation } from "react-i18next";
import { Building2, Users, CalendarRange, Activity } from "lucide-react";
import StatCard from "../../components/StatCard";
import GlassCard from "../../components/GlassCard";

export default function AdminOverview() {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Building2,
      label: t("admin.totalSalons"),
      value: "84",
      hint: "+6 este mes",
      accent: "from-sky-400 to-violet-500",
      testId: "admin-stat-salons",
    },
    {
      icon: Users,
      label: t("admin.totalUsers"),
      value: "12.4k",
      hint: "+12% MoM",
      accent: "from-magenta-500 to-pink-300",
      testId: "admin-stat-users",
    },
    {
      icon: CalendarRange,
      label: t("admin.monthlyBookings"),
      value: "5.821",
      hint: "+9% MoM",
      accent: "from-violet-500 to-magenta-500",
      testId: "admin-stat-bookings",
    },
    {
      icon: Activity,
      label: t("admin.platformHealth"),
      value: "99.98%",
      hint: "uptime últimos 30d",
      accent: "from-sky-400 to-magenta-500",
      testId: "admin-stat-health",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="admin-overview">
      <header>
        <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest">
          {t("admin.panel")}
        </p>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-violet-900 tracking-tight">
          <span className="rm-text-gradient">{t("admin.overview")}</span>
        </h1>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </section>

      <GlassCard testId="admin-coming-soon" hoverable={false}>
        <h2 className="font-display font-bold text-xl text-violet-900">
          {t("admin.comingSoon")}
        </h2>
        <p className="mt-1.5 text-violet-500">
          Las métricas reales se conectarán a Supabase en la siguiente fase.
        </p>
      </GlassCard>
    </div>
  );
}
