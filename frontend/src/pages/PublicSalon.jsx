import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { categoryMeta, formatPrice } from "../lib/catalog";
import Logo from "../components/Logo";
import Skeleton from "../components/Skeleton";

/**
 * Public salon page — accessible to anon and authenticated users.
 *
 * Single-page premium showcase: hero with branding + Roomie personality,
 * featured services and products, and a WhatsApp CTA. RLS on services/
 * products already filters to is_active rows for non-tenant viewers.
 */
export default function PublicSalon() {
  const { slug } = useParams();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const withTimeout = (p, ms = 8000) =>
      Promise.race([
        Promise.resolve(p),
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ error: { message: "timeout" }, data: null }),
            ms
          )
        ),
      ]);

    (async () => {
      setLoading(true);
      setNotFound(false);
      setLoadError(false);
      try {
        const sRes = await withTimeout(
          supabase
            .from("salons")
            .select(
              "id, name, slug, logo_url, primary_color, secondary_color, whatsapp_number, roomie_personality, updated_at"
            )
            .eq("slug", slug)
            .eq("is_active", true)
            .maybeSingle()
        );

        if (cancelled) return;
        if (sRes?.error?.message === "timeout") {
          setLoadError(true);
          return;
        }
        const s = sRes?.data;
        if (!s) {
          setNotFound(true);
          return;
        }
        setSalon(s);

        const [svcRes, prdRes] = await Promise.allSettled([
          withTimeout(
            supabase
              .from("services")
              .select(
                "id, name, description, category, duration_minutes, price_cents, currency, image_url"
              )
              .eq("salon_id", s.id)
              .eq("is_active", true)
              .order("created_at", { ascending: false })
              .limit(6)
          ),
          withTimeout(
            supabase
              .from("products")
              .select(
                "id, name, brand, description, price_cents, currency, image_url"
              )
              .eq("salon_id", s.id)
              .eq("is_active", true)
              .order("created_at", { ascending: false })
              .limit(6)
          ),
        ]);
        if (cancelled) return;
        setServices(svcRes.status === "fulfilled" ? svcRes.value?.data || [] : []);
        setProducts(prdRes.status === "fulfilled" ? prdRes.value?.data || [] : []);
      } catch (e) {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen rm-bg-aurora p-6" data-testid="public-salon-loading">
        <Skeleton variant="card" />
      </div>
    );
  }

  if (notFound || !salon) {
    const isTimeout = loadError && !salon;
    return (
      <div
        className="min-h-screen rm-bg-aurora flex items-center justify-center p-6"
        data-testid={isTimeout ? "public-salon-error" : "public-salon-notfound"}
      >
        <div className="rm-glass-strong rounded-3xl p-8 max-w-md text-center">
          <AlertCircle size={28} className="mx-auto text-magenta-500" />
          <h1 className="mt-3 font-display font-extrabold text-2xl text-violet-900">
            {isTimeout ? "No pudimos cargar el salón" : "Salón no encontrado"}
          </h1>
          <p className="mt-2 text-violet-500 text-sm">
            {isTimeout
              ? "Hubo un problema al traer la información. Intenta de nuevo en unos segundos."
              : "Puede que el enlace haya cambiado o el salón ya no esté disponible."}
          </p>
          <div className="mt-5 flex gap-2 justify-center">
            {isTimeout && (
              <button
                onClick={() => window.location.reload()}
                className="rm-btn-primary"
                data-testid="public-salon-retry"
              >
                Reintentar
              </button>
            )}
            <Link
              to="/app/discover"
              className={isTimeout ? "rm-btn-ghost" : "rm-btn-primary"}
              data-testid="public-salon-back-cta"
            >
              <ArrowLeft size={16} /> Volver a Discover
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const gradient = `linear-gradient(135deg, ${salon.secondary_color} 0%, ${salon.primary_color} 100%)`;
  const cacheBuster = salon.updated_at
    ? `?t=${new Date(salon.updated_at).getTime()}`
    : "";
  const personality = salon.roomie_personality || {};
  const whatsappNumber = salon.whatsapp_number;
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hola, vengo desde Roomie y quiero reservar en ${salon.name}.`
      )}`
    : null;

  return (
    <div className="min-h-screen rm-bg-aurora" data-testid="public-salon-page">
      <header className="max-w-5xl mx-auto px-4 md:px-8 pt-6 flex items-center justify-between">
        <span data-testid="public-salon-home-link">
          <Logo size="sm" to="/" />
        </span>
        <Link
          to="/app/discover"
          className="rm-chip hover:bg-white/80"
          data-testid="public-salon-back"
        >
          <ArrowLeft size={12} /> Discover
        </Link>
      </header>

      {/* Hero */}
      <section
        className="max-w-5xl mx-auto px-4 md:px-8 mt-6"
        data-testid="public-salon-hero"
      >
        <div
          className="rounded-[2.5rem] p-8 md:p-12 text-white shadow-glow relative overflow-hidden"
          style={{ background: gradient }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {salon.logo_url ? (
              <img
                src={`${salon.logo_url}${cacheBuster}`}
                alt={salon.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover ring-4 ring-white/40 shadow-glow"
                data-testid="public-salon-logo"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span
                className="inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white/25 backdrop-blur-md ring-4 ring-white/40 font-display font-extrabold text-4xl md:text-5xl"
                data-testid="public-salon-monogram"
              >
                {salon.name?.charAt(0)?.toUpperCase() || "R"}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] opacity-80">
                Salón Roomie
              </p>
              <h1
                className="font-display font-extrabold text-3xl md:text-5xl tracking-tight break-words"
                data-testid="public-salon-name"
              >
                {salon.name}
              </h1>
              <p className="mt-1 opacity-90 text-sm">
                roomie.app/{salon.slug}
              </p>
            </div>
          </div>

          {/* Personality preview */}
          {(personality.tone || personality.style) && (
            <div
              className="mt-6 flex flex-wrap gap-2"
              data-testid="public-salon-personality"
            >
              {personality.tone && (
                <span className="rm-chip bg-white/25 text-white border-white/30 capitalize">
                  <Sparkles size={11} /> Tono · {personality.tone}
                </span>
              )}
              {personality.style && (
                <span className="rm-chip bg-white/25 text-white border-white/30 capitalize">
                  Estilo · {personality.style}
                </span>
              )}
              {personality.sales_style && (
                <span className="rm-chip bg-white/25 text-white border-white/30 capitalize">
                  {personality.sales_style.replace(/_/g, " ")}
                </span>
              )}
            </div>
          )}

          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-violet-900 font-semibold px-6 py-3 shadow-pill hover:shadow-glow transition-all"
              data-testid="public-salon-whatsapp-cta"
            >
              <MessageCircle size={16} /> Reservar por WhatsApp
            </a>
          )}
        </div>
      </section>

      {/* Services */}
      <section
        className="max-w-5xl mx-auto px-4 md:px-8 mt-10"
        data-testid="public-salon-services"
      >
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold">
              Servicios
            </p>
            <h2 className="font-display font-bold text-2xl text-violet-900">
              Rituales destacados
            </h2>
          </div>
          {services.length > 0 && (
            <p className="text-xs text-violet-400">{services.length} disponibles</p>
          )}
        </div>

        {services.length === 0 ? (
          <div
            className="rm-glass rounded-3xl p-6 text-center text-violet-500 text-sm"
            data-testid="public-salon-services-empty"
          >
            Este salón aún no ha publicado servicios.
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc) => {
              const meta = categoryMeta(svc.category);
              const Icon = meta.icon;
              return (
                <li
                  key={svc.id}
                  className="rm-glass rounded-3xl overflow-hidden"
                  data-testid={`public-salon-service-${svc.id}`}
                >
                  {svc.image_url ? (
                    <img
                      src={svc.image_url}
                      alt={svc.name}
                      className="aspect-[16/10] w-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div
                      className="aspect-[16/10] w-full"
                      style={{ background: gradient, opacity: 0.85 }}
                    />
                  )}
                  <div className="p-5">
                    <span className="rm-chip mb-2">
                      <Icon size={11} className="text-magenta-500" />
                      {meta.label}
                    </span>
                    <h3 className="font-display font-bold text-violet-900 truncate">
                      {svc.name}
                    </h3>
                    {svc.description && (
                      <p className="text-sm text-violet-500 mt-1 line-clamp-2">
                        {svc.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-violet-400">
                        {svc.duration_minutes} min
                      </span>
                      <span className="font-bold text-violet-900">
                        {formatPrice(svc.price_cents, svc.currency)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Products */}
      <section
        className="max-w-5xl mx-auto px-4 md:px-8 mt-10 pb-16"
        data-testid="public-salon-products"
      >
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold">
              Productos
            </p>
            <h2 className="font-display font-bold text-2xl text-violet-900">
              Recomendados por el salón
            </h2>
          </div>
          {products.length > 0 && (
            <p className="text-xs text-violet-400">{products.length} disponibles</p>
          )}
        </div>

        {products.length === 0 ? (
          <div
            className="rm-glass rounded-3xl p-6 text-center text-violet-500 text-sm"
            data-testid="public-salon-products-empty"
          >
            Aún no hay productos publicados.
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prd) => (
              <li
                key={prd.id}
                className="rm-glass rounded-3xl overflow-hidden"
                data-testid={`public-salon-product-${prd.id}`}
              >
                {prd.image_url ? (
                  <img
                    src={prd.image_url}
                    alt={prd.name}
                    className="aspect-square w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div
                    className="aspect-square w-full"
                    style={{ background: gradient, opacity: 0.6 }}
                  />
                )}
                <div className="p-5">
                  {prd.brand && (
                    <p className="text-[11px] uppercase tracking-widest text-violet-400 font-semibold truncate">
                      {prd.brand}
                    </p>
                  )}
                  <h3 className="font-display font-bold text-violet-900 truncate">
                    {prd.name}
                  </h3>
                  {prd.description && (
                    <p className="text-sm text-violet-500 mt-1 line-clamp-2">
                      {prd.description}
                    </p>
                  )}
                  <p className="mt-3 font-bold text-violet-900">
                    {formatPrice(prd.price_cents, prd.currency)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="max-w-5xl mx-auto px-4 md:px-8 pb-10 text-center">
        <p className="text-xs text-violet-400">
          Powered by <span className="font-bold rm-text-gradient">Roomie</span>
          {" · "}Personal Care & Wellbeing
        </p>
      </footer>
    </div>
  );
}
