import { useCallback, useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Package, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { mapSupabaseError } from "../../lib/errors";
import { formatPrice } from "../../lib/catalog";
import GlassCard from "../../components/GlassCard";
import EmptyState from "../../components/EmptyState";
import Skeleton from "../../components/Skeleton";
import ProductFormModal from "../../components/ProductFormModal";

export default function Products() {
  const { salonId } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!salonId) return;
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from("products")
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
      .from("products")
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
    const { error: e } = await supabase.from("products").delete().eq("id", row.id);
    if (e) {
      setError(mapSupabaseError(e));
      return;
    }
    refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="products-page">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest">
            Catálogo
          </p>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-violet-900 tracking-tight">
            <span className="rm-text-gradient">Productos</span>
          </h1>
          <p className="mt-1 text-violet-500 text-sm">
            Recomienda los productos que usas y vendes en tu salón.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="rm-btn-primary self-start sm:self-auto"
          data-testid="products-new-btn"
        >
          <Plus size={16} /> Nuevo producto
        </button>
      </header>

      {error && (
        <div
          className="flex items-start gap-2 rounded-2xl bg-magenta-500/10 border border-magenta-500/20 p-3 text-sm text-magenta-600"
          data-testid="products-error"
        >
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="products-loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aún no has añadido productos"
          description="Comparte los productos premium que recomiendas a tus clientas."
          cta="Añadir primer producto"
          onAction={startCreate}
          testId="products-empty"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((row) => (
            <GlassCard
              key={row.id}
              className="!p-0 overflow-hidden flex flex-col"
              testId={`product-card-${row.id}`}
            >
              <div className="relative aspect-square bg-gradient-to-br from-cream-100 via-violet-100 to-magenta-100">
                {row.image_url ? (
                  <img
                    src={row.image_url}
                    alt={row.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-violet-300">
                    <Package size={40} />
                  </div>
                )}
                {row.category && (
                  <span className="absolute top-3 left-3 rm-chip !bg-white/85">
                    {row.category}
                  </span>
                )}
                {!row.is_active && (
                  <span className="absolute top-3 right-3 rm-chip !bg-violet-900/70 !text-white !border-transparent">
                    Borrador
                  </span>
                )}
              </div>

              <div className="flex-1 p-5 flex flex-col">
                {row.brand && (
                  <p className="text-[11px] uppercase tracking-widest text-violet-400 font-semibold">
                    {row.brand}
                  </p>
                )}
                <h3 className="font-display font-bold text-violet-900 line-clamp-1">
                  {row.name}
                </h3>
                {row.description && (
                  <p className="mt-1 text-sm text-violet-500 line-clamp-2">
                    {row.description}
                  </p>
                )}
                <p className="mt-3 font-bold text-violet-900">
                  {formatPrice(row.price_cents, row.currency)}
                </p>
                {row.recommended_for?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {row.recommended_for.slice(0, 3).map((t) => (
                      <span key={t} className="rm-chip text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-violet-100/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleActive(row)}
                    className="text-xs font-semibold text-violet-500 hover:text-magenta-500 transition-colors"
                    data-testid={`product-toggle-${row.id}`}
                  >
                    {row.is_active ? "Desactivar" : "Activar"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(row)}
                      className="p-2 rounded-xl text-violet-500 hover:bg-white/70 hover:text-violet-900 transition-colors"
                      data-testid={`product-edit-${row.id}`}
                      aria-label="Editar"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => remove(row)}
                      className="p-2 rounded-xl text-violet-500 hover:bg-magenta-500/10 hover:text-magenta-600 transition-colors"
                      data-testid={`product-delete-${row.id}`}
                      aria-label="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <ProductFormModal
        open={open}
        product={editing}
        salonId={salonId}
        onClose={() => setOpen(false)}
        onSaved={refresh}
      />
    </div>
  );
}
