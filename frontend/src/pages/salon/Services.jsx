import { useCallback, useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Scissors, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { mapSupabaseError } from "../../lib/errors";
import { categoryMeta, formatPrice } from "../../lib/catalog";
import GlassCard from "../../components/GlassCard";
import EmptyState from "../../components/EmptyState";
import Skeleton from "../../components/Skeleton";
import ServiceFormModal from "../../components/ServiceFormModal";

export default function Services() {
  const { salonId } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // service row or null
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!salonId) return;
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from("services")
      .select("*")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false });
    if (e) setError(mapSupabaseError(e));
    else setRows(data || []);
    setLoading(false);
  }, [salonId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const startEdit = (row) => {
    setEditing(row);
    setOpen(true);
  };

  const toggleActive = async (row) => {
    const { error: e } = await supabase
      .from("services")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);
    if (e) {
      setError(mapSupabaseError(e));
      return;
    }
    refresh();
  };

  const remove = async (row) => {
    if (!window.confirm(`¿Eliminar "${row.name}"? Esta acción no se puede deshacer.`)) return;
    const { error: e } = await supabase.from("services").delete().eq("id", row.id);
    if (e) {
      setError(mapSupabaseError(e));
      return;
    }
    refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="services-page">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest">
            Catálogo
          </p>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-violet-900 tracking-tight">
            <span className="rm-text-gradient">Servicios</span>
          </h1>
          <p className="mt-1 text-violet-500 text-sm">
            Cura los rituales premium que ofreces.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="rm-btn-primary self-start sm:self-auto"
          data-testid="services-new-btn"
        >
          <Plus size={16} /> Nuevo servicio
        </button>
      </header>

      {error && (
        <div
          className="flex items-start gap-2 rounded-2xl bg-magenta-500/10 border border-magenta-500/20 p-3 text-sm text-magenta-600"
          data-testid="services-error"
        >
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="services-loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="Tu menú de autor te espera"
          description="Diseña y cura los rituales de belleza que volverán locas a tus clientas. Entra a las grandes ligas con tu primer servicio estrella."
          cta="Diseñar mi primer ritual"
          onAction={startCreate}
          testId="services-empty"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((row) => {
            const cat = categoryMeta(row.category);
            const Icon = cat.icon;
            return (
              <GlassCard
                key={row.id}
                className="!p-0 overflow-hidden flex flex-col"
                testId={`service-card-${row.id}`}
              >
                <div className="relative h-32 bg-gradient-to-br from-sky-400 via-violet-500 to-magenta-500">
                  {row.image_url && (
                    <img
                      src={row.image_url}
                      alt={row.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute top-3 left-3 rm-chip !bg-white/85">
                    <Icon size={11} className="text-magenta-500" />
                    {cat.label}
                  </span>
                  {!row.is_active && (
                    <span className="absolute top-3 right-3 rm-chip !bg-violet-900/70 !text-white !border-transparent">
                      Borrador
                    </span>
                  )}
                </div>

                <div className="flex-1 p-5 flex flex-col">
                  <h3 className="font-display font-bold text-violet-900 line-clamp-1">
                    {row.name}
                  </h3>
                  {row.description && (
                    <p className="mt-1 text-sm text-violet-500 line-clamp-2">
                      {row.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <span className="font-bold text-violet-900">
                      {formatPrice(row.price_cents, row.currency)}
                    </span>
                    <span className="rm-chip">{row.duration_minutes} min</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-violet-100/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleActive(row)}
                      className="text-xs font-semibold text-violet-500 hover:text-magenta-500 transition-colors"
                      data-testid={`service-toggle-${row.id}`}
                    >
                      {row.is_active ? "Desactivar" : "Activar"}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(row)}
                        className="p-2 rounded-xl text-violet-500 hover:bg-white/70 hover:text-violet-900 transition-colors"
                        data-testid={`service-edit-${row.id}`}
                        aria-label="Editar"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => remove(row)}
                        className="p-2 rounded-xl text-violet-500 hover:bg-magenta-500/10 hover:text-magenta-600 transition-colors"
                        data-testid={`service-delete-${row.id}`}
                        aria-label="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <ServiceFormModal
        open={open}
        service={editing}
        salonId={salonId}
        onClose={() => setOpen(false)}
        onSaved={refresh}
      />
    </div>
  );
}
