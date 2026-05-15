import { useTranslation } from "react-i18next";
import { CalendarHeart, Sparkles, Gem, MapPin, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import GlassCard from "../../components/GlassCard";

export default function ClientHome() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "Roomie";

  const featuredSalons = [
    { name: "Aurora Beauty Lab", area: "Polanco", tag: "Cabello" },
    { name: "Maison Lumière", area: "Condesa", tag: "Skincare" },
    { name: "Velvet Atelier", area: "Roma Norte", tag: "Manicura" },
  ];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="client-home">
      <header className="space-y-1.5">
        <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest">
          {new Date().toLocaleDateString("es", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-violet-900 tracking-tight">
          {t("client.greeting", { name: firstName })}
        </h1>
        <p className="text-violet-500">{t("client.subtitle")}</p>
      </header>

      <GlassCard testId="client-next-booking" hoverable={false}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rm-chip mb-3">
              <CalendarHeart size={12} className="text-magenta-500" />
              {t("client.nextBooking")}
            </span>
            <p className="text-violet-500">
              {t("client.nextBookingEmpty")}
            </p>
          </div>
          <button className="rm-btn-primary text-sm px-4 py-2">
            {t("nav.discover")}
            <ChevronRight size={14} />
          </button>
        </div>
      </GlassCard>

      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="font-display font-bold text-xl text-violet-900">
            {t("client.exploreSalons")}
          </h2>
          <button className="text-sm font-semibold text-violet-500 hover:text-magenta-500 transition-colors">
            {t("nav.discover")}
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredSalons.map((s, i) => (
            <GlassCard
              key={s.name}
              testId={`client-featured-salon-${i}`}
              className="!p-0 overflow-hidden"
            >
              <div className="h-28 bg-gradient-to-br from-sky-400 via-violet-500 to-magenta-500 relative">
                <span className="absolute top-3 left-3 rm-chip !bg-white/85">
                  <Gem size={11} className="text-magenta-500" />
                  {s.tag}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-violet-900">{s.name}</h3>
                <p className="mt-0.5 text-sm text-violet-500 flex items-center gap-1">
                  <MapPin size={12} /> {s.area}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <GlassCard testId="client-rituals">
          <span className="rm-chip mb-3">
            <Sparkles size={12} className="text-magenta-500" />
            {t("client.myRituals")}
          </span>
          <p className="text-violet-500 text-sm">{t("client.comingSoon")}</p>
        </GlassCard>
        <GlassCard testId="client-favorites">
          <span className="rm-chip mb-3">
            <Gem size={12} className="text-magenta-500" />
            {t("client.favorites")}
          </span>
          <p className="text-violet-500 text-sm">{t("client.comingSoon")}</p>
        </GlassCard>
      </section>
    </div>
  );
}
