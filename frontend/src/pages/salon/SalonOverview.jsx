import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarRange,
  Scissors,
  Package,
  Plus,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { suggestServicesForSalon } from "../../lib/ai";
import { PremiumGate } from "../../components/ui/PremiumGate";
import { supabase } from "../../lib/supabase";
import { mapSupabaseError } from "../../lib/errors";
import StatCard from "../../components/StatCard";
import GlassCard from "../../components/GlassCard";
import EmptyState from "../../components/EmptyState";
import Skeleton from "../../components/Skeleton";
import InstallPWAButton from "../../components/InstallPWAButton";

export default function SalonOverview() {
  const { profile, salonId } = useAuth();
  const [stats, setStats] = useState({
    services: 0,
    products: 0,
    appointments: 0,
  });
  const [salon, setSalon] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const refresh = useCallback(async () => {
    if (!salonId) return;
    setLoading(true);
    setError(null);

    const withTimeout = (p, ms = 5000) =>
      Promise.race([
        p,
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ error: { message: "Tiempo de espera agotado." } }),
            ms
          )
        ),
      ]);

    const now = new Date().toISOString();
    try {
      const [svcRes, prdRes, apRes, sRes] = await Promise.all([
        withTimeout(
          supabase
            .from("services")
            .select("id", { count: "exact", head: true })
            .eq("salon_id", salonId)
            .eq("is_active", true)
        ),
        withTimeout(
          supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("salon_id", salonId)
            .eq("is_active", true)
        ),
        withTimeout(
          supabase
            .from("appointments")
            .select(
              "id, starts_at, ends_at, status, notes, services(name, duration_minutes), profiles:client_id(full_name)"
            )
            .eq("salon_id", salonId)
            .gte("starts_at", now)
            .order("starts_at", { ascending: true })
            .limit(5)
        ),
        withTimeout(
          supabase.from("salons").select("*").eq("id", salonId).maybeSingle()
        ),
      ]);

      const firstError =
        svcRes?.error || prdRes?.error || apRes?.error || sRes?.error;
      if (firstError) {
        setError(mapSupabaseError(firstError));
      }

      setStats({
        services: svcRes?.count ?? 0,
        products: prdRes?.count ?? 0,
        appointments: apRes?.data?.length ?? 0,
      });
      setUpcoming(apRes?.data || []);
      setSalon(sRes?.data || null);

      if (sRes?.data) {
        suggestServicesForSalon(sRes.data, []).then(res => {
          setInsights(res.suggestions || []);
          setLoadingInsights(false);
        });
      }
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const firstName = profile?.full_name?.split(" ")[0] || "Tu salón";

  return (
    <div className="space-y-6 animate-fade-in" data-testid="salon-overview">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest">
            Workspace
          </p>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-violet-900 tracking-tight break-words">
            {salon?.name || firstName} ·{" "}
            <span className="rm-text-gradient">Hoy</span>
          </h1>
          {salon?.slug && (
            <p className="text-violet-400 text-sm mt-0.5">
              roomie.app/{salon.slug}
            </p>
          )}
        </div>
        {salon?.logo_url ? (
          <img
            src={`${salon.logo_url}?t=${
              salon?.updated_at ? new Date(salon.updated_at).getTime() : Date.now()
            }`}
            alt={salon.name}
            className="w-14 h-14 rounded-2xl object-cover shadow-soft self-start sm:self-auto"
            data-testid="salon-overview-logo"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <span
            className="w-14 h-14 rounded-2xl shadow-soft self-start sm:self-auto flex items-center justify-center text-white font-display font-extrabold text-xl"
            style={{
              background: `linear-gradient(135deg, ${
                salon?.secondary_color || "#7C52AA"
              } 0%, ${salon?.primary_color || "#E040A0"} 100%)`,
            }}
            data-testid="salon-overview-logo-fallback"
          >
            {(salon?.name || firstName)?.charAt(0)?.toUpperCase() || "R"}
          </span>
        )}
      </header>

      {error && (
        <div
          className="rounded-2xl bg-magenta-500/10 border border-magenta-500/20 p-3 text-sm text-magenta-600"
          data-testid="overview-error"
        >
          {error}
        </div>
      )}

      {/* KPIs */}
      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4" data-testid="overview-loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : (
        <section className="grid sm:grid-cols-3 gap-4">
          <StatCard
            icon={Scissors}
            label="Servicios activos"
            value={stats.services}
            hint="catálogo público"
            accent="from-magenta-500 to-pink-300"
            testId="kpi-services"
          />
          <StatCard
            icon={Package}
            label="Productos activos"
            value={stats.products}
            hint="recomendaciones"
            accent="from-sky-400 to-violet-500"
            testId="kpi-products"
          />
          <StatCard
            icon={CalendarRange}
            label="Próximas citas"
            value={stats.appointments}
            hint="los próximos días"
            accent="from-violet-500 to-magenta-500"
            testId="kpi-appointments"
          />
        </section>
      )}

      {/* Upcoming */}
      <GlassCard testId="salon-upcoming" hoverable={false}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-violet-900">
            Próximas citas
          </h2>
        </div>

        {loading ? (
          <Skeleton count={3} className="space-y-3" />
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarRange}
            title="Tu lienzo en blanco"
            description="Las grandes agendas empiezan así. Mientras recibes tus primeras reservas premium, asegúrate de tener todo tu catálogo brillante."
            cta="Diseñar mis servicios"
            onAction={() => (window.location.href = "/salon/services")}
            testId="upcoming-empty"
            className="!shadow-none !border-0 !bg-transparent"
          />
        ) : (
          <ul className="space-y-3">
            {upcoming.map((row) => {
              const date = new Date(row.starts_at);
              const time = date.toLocaleTimeString("es", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const day = date.toLocaleDateString("es", {
                weekday: "short",
                day: "numeric",
              });
              return (
                <li
                  key={row.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 hover:bg-white/70 transition-colors"
                  data-testid={`upcoming-row-${row.id}`}
                >
                  <div className="w-14 sm:w-16 text-center flex-shrink-0">
                    <p className="text-sm font-bold text-violet-900">{time}</p>
                    <p className="text-[10px] uppercase tracking-widest text-violet-400">
                      {day}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-violet-900 truncate">
                      {row.profiles?.full_name || "Clienta"}
                    </p>
                    <p className="text-sm text-violet-500 truncate">
                      {row.services?.name || "Cita"}
                    </p>
                  </div>
                  <span className="rm-chip hidden sm:inline-flex flex-shrink-0 capitalize">
                    {row.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>

      {/* Roomie Sugiere (P0 AI Lite) */}
      <PremiumGate featureId="roomie_suggests">
        <GlassCard testId="salon-roomie-suggests" className="border border-magenta-500/20 bg-gradient-to-br from-magenta-500/5 to-violet-500/5 shadow-glow" hoverable={false}>
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 bg-gradient-to-br from-magenta-500 to-violet-500 rounded-xl shadow-glow text-white">
              <Lightbulb size={20} strokeWidth={2} />
            </span>
            <h2 className="font-display font-bold text-xl text-violet-900 dark:text-white">
              Roomie Sugiere ✨
            </h2>
          </div>
          
          {loadingInsights ? (
             <Skeleton count={2} className="space-y-3" />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-white/60 dark:bg-gray-800/60 p-5 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 shadow-soft">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-violet-900 dark:text-white font-display text-lg leading-tight">{insight.name}</h4>
                      <span className="text-xs font-bold text-magenta-500 bg-magenta-500/10 px-2 py-1 rounded-full">{insight.est_price}</span>
                    </div>
                    <p className="text-sm text-violet-600 dark:text-gray-300 font-medium leading-relaxed mb-4">{insight.rationale}</p>
                  </div>
                  <button className="text-xs font-bold text-left text-magenta-500 hover:text-magenta-600 transition-colors uppercase tracking-widest flex items-center gap-1">
                    <Plus size={14}/> Agregar a servicios
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </PremiumGate>

      {/* Quick actions */}
      <section className="grid sm:grid-cols-3 gap-4">
        <Link
          to="/salon/services"
          className="rm-glass rounded-3xl p-5 hover:shadow-glow transition-all hover:-translate-y-0.5"
          data-testid="quick-services"
        >
          <Scissors size={18} className="text-magenta-500" />
          <p className="mt-3 font-display font-bold text-violet-900">
            Gestiona tus servicios
          </p>
          <p className="text-sm text-violet-500 mt-1">
            Crea, edita y publica rituales premium.
          </p>
          <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-magenta-500">
            <Plus size={14} /> Nuevo servicio
          </span>
        </Link>
        <Link
          to="/salon/products"
          className="rm-glass rounded-3xl p-5 hover:shadow-glow transition-all hover:-translate-y-0.5"
          data-testid="quick-products"
        >
          <Package size={18} className="text-violet-500" />
          <p className="mt-3 font-display font-bold text-violet-900">
            Gestiona tus productos
          </p>
          <p className="text-sm text-violet-500 mt-1">
            Comparte tus recomendaciones estrella.
          </p>
          <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-violet-500">
            <Plus size={14} /> Nuevo producto
          </span>
        </Link>
        <div
          className="rm-glass rounded-3xl p-5 opacity-90"
          data-testid="quick-vision"
        >
          <Sparkles size={18} className="text-sky-500" />
          <p className="mt-3 font-display font-bold text-violet-900">
            Roomie Vision (Beta)
          </p>
          <p className="text-sm text-violet-500 mt-1">
            Próximamente: propuestas visuales generadas con IA para tus clientas.
          </p>
        </div>
      </section>

      {/* PWA install CTA */}
      <InstallPWAButton variant="card" />
    </div>
  );
}
