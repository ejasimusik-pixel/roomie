import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CalendarHeart, Sparkles, Gem, ChevronRight, Compass } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import GlassCard from "../../components/GlassCard";
import EmptyState from "../../components/EmptyState";

export default function ClientHome() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] || "Roomie";

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
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-violet-900 tracking-tight break-words">
          {t("client.greeting", { name: firstName })}
        </h1>
        <p className="text-violet-500">{t("client.subtitle")}</p>
      </header>

      <GlassCard testId="client-next-booking" hoverable={false}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <span className="rm-chip mb-3">
              <CalendarHeart size={12} className="text-magenta-500" />
              {t("client.nextBooking")}
            </span>
            <p className="text-violet-500">
              {t("client.nextBookingEmpty")}
            </p>
          </div>
          <button
            onClick={() => navigate("/app/discover")}
            data-testid="client-discover-cta"
            className="rm-btn-primary text-sm px-4 py-2 self-start sm:self-auto whitespace-nowrap"
          >
            {t("nav.discover")}
            <ChevronRight size={14} />
          </button>
        </div>
      </GlassCard>

      <section>
        <div className="flex items-end justify-between mb-3 gap-3">
          <h2 className="font-display font-bold text-xl text-violet-900">
            {t("client.exploreSalons")}
          </h2>
        </div>
        <EmptyState
          icon={Compass}
          title="Aún no hay salones disponibles"
          description="Estamos seleccionando los salones premium que pronto podrás reservar desde aquí."
          testId="client-salons-empty"
        />
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
