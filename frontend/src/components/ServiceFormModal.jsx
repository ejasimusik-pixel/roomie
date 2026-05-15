import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, Loader2 } from "lucide-react";
import Modal from "./Modal";
import ImageUploader from "./ImageUploader";
import { SERVICE_CATEGORIES, CURRENCY_DEFAULT } from "../lib/catalog";
import { BUCKETS } from "../lib/storage";
import { supabase } from "../lib/supabase";
import { mapSupabaseError } from "../lib/errors";

/**
 * Drawer-like modal to create / edit a salon service. The parent owns the
 * "open" flag and the row being edited (or null for create).
 */
export default function ServiceFormModal({
  open,
  service,
  salonId,
  onClose,
  onSaved,
}) {
  const editing = !!service?.id;
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const [image, setImage] = useState({ url: null, path: null });
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (!open) return;
    reset({
      name: service?.name || "",
      description: service?.description || "",
      category: service?.category || "hair",
      duration_minutes: service?.duration_minutes ?? 60,
      price_cents: service?.price_cents != null ? service.price_cents / 100 : "",
      currency: service?.currency || CURRENCY_DEFAULT,
      is_active: service?.is_active ?? true,
    });
    setImage({ url: service?.image_url || null, path: null });
    setServerError(null);
  }, [open, service, reset]);

  const isActive = watch("is_active");

  const onSubmit = async (values) => {
    setServerError(null);

    const priceRaw = values.price_cents;
    const priceNum = Number(priceRaw);
    if (priceRaw === "" || priceRaw == null || Number.isNaN(priceNum) || priceNum < 0) {
      setServerError("Precio inválido. Usa un número mayor o igual a 0.");
      return;
    }

    const payload = {
      salon_id: salonId,
      name: values.name.trim(),
      description: values.description?.trim() || null,
      category: values.category,
      duration_minutes: Number(values.duration_minutes) || 60,
      price_cents: Math.round(priceNum * 100),
      currency: values.currency || CURRENCY_DEFAULT,
      image_url: image.url || null,
      is_active: !!values.is_active,
    };

    let res;
    try {
      const op = editing
        ? supabase.from("services").update(payload).eq("id", service.id).select().single()
        : supabase.from("services").insert(payload).select().single();
      res = await Promise.race([
        op,
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                error: { message: "La operación tardó demasiado. Intenta de nuevo." },
              }),
            10000
          )
        ),
      ]);
    } catch (err) {
      setServerError(mapSupabaseError(err));
      return;
    }

    if (res?.error) {
      setServerError(mapSupabaseError(res.error));
      return;
    }
    onSaved?.(res.data);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? "Editar servicio" : "Nuevo servicio"}
      subtitle="Define los rituales premium que ofreces"
      testId="service-modal"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rm-btn-ghost"
            data-testid="service-cancel-btn"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="service-form"
            disabled={isSubmitting}
            className="rm-btn-primary"
            data-testid="service-save-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Guardando…
              </>
            ) : editing ? (
              "Guardar cambios"
            ) : (
              "Crear servicio"
            )}
          </button>
        </>
      }
    >
      <form
        id="service-form"
        onSubmit={handleSubmit(onSubmit)}
        className="grid md:grid-cols-2 gap-5"
      >
        <div className="space-y-4">
          <div>
            <label className="rm-label">Nombre</label>
            <input
              type="text"
              className="rm-input"
              placeholder="Balayage premium"
              data-testid="service-name-input"
              {...register("name", { required: true, minLength: 2 })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-magenta-500">Nombre requerido.</p>
            )}
          </div>

          <div>
            <label className="rm-label">Descripción</label>
            <textarea
              rows={3}
              className="rm-input resize-none"
              placeholder="Una experiencia de color personalizada con productos premium…"
              data-testid="service-description-input"
              {...register("description")}
            />
          </div>

          <div>
            <label className="rm-label">Categoría</label>
            <select
              className="rm-input appearance-none cursor-pointer"
              data-testid="service-category-select"
              {...register("category", { required: true })}
            >
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="rm-label">Duración (min)</label>
              <input
                type="number"
                min={5}
                step={5}
                className="rm-input"
                data-testid="service-duration-input"
                {...register("duration_minutes", {
                  required: true,
                  valueAsNumber: true,
                  min: 5,
                })}
              />
            </div>
            <div>
              <label className="rm-label">Precio</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="rm-input flex-1"
                  placeholder="0"
                  data-testid="service-price-input"
                  {...register("price_cents", { required: true, min: 0 })}
                />
                <select
                  className="rm-input w-24"
                  data-testid="service-currency-select"
                  {...register("currency")}
                >
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only"
              data-testid="service-active-toggle"
              {...register("is_active")}
            />
            <span
              className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${
                isActive ? "bg-gradient-to-r from-magenta-500 to-violet-500" : "bg-violet-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-soft transition-transform ${
                  isActive ? "translate-x-5" : ""
                }`}
              />
            </span>
            <span className="text-sm font-medium text-violet-700">
              {isActive ? "Activo y visible" : "Borrador (oculto)"}
            </span>
          </label>
        </div>

        <div>
          <ImageUploader
            bucket={BUCKETS.SERVICES}
            scopeId={salonId}
            value={image.url}
            onUploaded={({ url, path }) => setImage({ url, path })}
            onClear={() => setImage({ url: null, path: null })}
            label="Imagen del servicio (opcional)"
            aspect="wide"
            testId="service-image-uploader"
          />
        </div>

        {serverError && (
          <div
            className="md:col-span-2 flex items-start gap-2 rounded-2xl bg-magenta-500/10 border border-magenta-500/20 p-3 text-sm text-magenta-600"
            data-testid="service-error"
          >
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <p>{serverError}</p>
          </div>
        )}
      </form>
    </Modal>
  );
}
