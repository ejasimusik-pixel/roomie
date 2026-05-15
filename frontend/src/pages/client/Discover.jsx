import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import EmptyState from "../../components/EmptyState";
import Skeleton from "../../components/Skeleton";
import { categoryMeta } from "../../lib/catalog";

/**
 * Discover — clients browse the real, active salons living on Roomie.
 * Renders premium glass cards using each salon's branding. No mocks.
 *
 * For each visible salon we also surface up to 3 service categories so a
 * client can sense the salon's expertise at a glance.
 */
export default function Discover() {
  const [salons, setSalons] = useState([]);
  const [catsBySalon, setCatsBySalon] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const withTimeout = (p, ms = 8000) =>
      Promise.race([
        Promise.resolve(p),
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ error: { message: "Tiempo de espera agotado." }, data: null }),
            ms
          )
        ),
      ]);

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const sRes = await withTimeout(
          supabase
            .from("salons")
            .select("id, name, slug, logo_url, primary_color, secondary_color, updated_at")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
        );

        if (cancelled) return;
        if (sRes?.error) {
          setError(sRes.error.message);
          setSalons([]);
          return;
        }
        const sList = sRes?.data || [];
        setSalons(sList);

        if (sList.length) {
          const ids = sList.map((s) => s.id);
          const svcRes = await withTimeout(
            supabase
              .from("services")
              .select("salon_id, category")
              .in("salon_id", ids)
              .eq("is_active", true)
          );
          if (cancelled) return;
          const map = {};
          (svcRes?.data || []).forEach((row) => {
            if (!row.category) return;
            map[row.salon_id] = map[row.salon_id] || new Set();
            map[row.salon_id].add(row.category);
          });
          const reduced = {};
          Object.entries(map).forEach(([k, set]) => {
            reduced[k] = Array.from(set).slice(0, 3);
          });
          setCatsBySalon(reduced);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Error cargando salones.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="client-discover">
      <header className="space-y-1.5">
        <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest">
          Discover
        </p>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-violet-900 tracking-tight">
          Salones <span className="rm-text-gradient">Roomie</span>
        </h1>
        <p className="text-violet-500">
          Espacios premium curados para ti. Cada uno con su propia personalidad.
        </p>
      </header>

      {error && (
        <div
          className="rounded-2xl bg-magenta-500/10 border border-magenta-500/20 p-3 text-sm text-magenta-600"
          data-testid="discover-error"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="discover-loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : salons.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Aún no hay salones disponibles"
          description="Estamos seleccionando los salones premium que pronto podrás reservar desde aquí."
          testId="discover-empty"
        />
      ) : (
        <ul
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-testid="discover-grid"
        >
          {salons.map((s) => (
            <SalonCard key={s.id} salon={s} categories={catsBySalon[s.id] || []} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SalonCard({ salon, categories }) {
  const gradient = `linear-gradient(135deg, ${salon.secondary_color} 0%, ${salon.primary_color} 100%)`;
  const cacheBuster = salon.updated_at
    ? `?t=${new Date(salon.updated_at).getTime()}`
    : "";

  return (
    <li>
      <Link
        to={`/discover/${salon.slug}`}
        data-testid={`discover-card-${salon.slug}`}
        className="group block rm-glass rounded-3xl overflow-hidden hover:shadow-glow transition-all hover:-translate-y-1"
      >
        <div
          className="aspect-[16/10] relative flex items-center justify-center"
          style={{ background: gradient }}
        >
          {salon.logo_url ? (
            <img
              src={`${salon.logo_url}${cacheBuster}`}
              alt={salon.name}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-white/40 shadow-glow"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/30 backdrop-blur-md ring-4 ring-white/40 text-white font-display font-extrabold text-3xl">
              {salon.name?.charAt(0)?.toUpperCase() || "R"}
            </span>
          )}
          <span className="absolute top-3 right-3 rm-chip bg-white/80 text-violet-700">
            <Sparkles size={11} className="text-magenta-500" />
            Premium
          </span>
        </div>
        <div className="p-5">
          <h3
            className="font-display font-extrabold text-lg text-violet-900 truncate"
            data-testid={`discover-card-${salon.slug}-name`}
          >
            {salon.name}
          </h3>
          <p className="text-xs text-violet-400 truncate">
            roomie.app/{salon.slug}
          </p>
          {categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const meta = categoryMeta(cat);
                const Icon = meta.icon;
                return (
                  <span
                    key={cat}
                    className="rm-chip text-[11px] py-1"
                    data-testid={`discover-card-${salon.slug}-cat-${cat}`}
                  >
                    <Icon size={10} className="text-magenta-500" />
                    {meta.label}
                  </span>
                );
              })}
            </div>
          )}
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-magenta-500 group-hover:gap-2 transition-all">
            Ver salón <ArrowRight size={14} />
          </span>
        </div>
      </Link>
    </li>
  );
}
