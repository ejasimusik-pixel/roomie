import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import Modal from "./Modal";
import ImageUploader from "./ImageUploader";
import { PRODUCT_TYPES, CURRENCY_DEFAULT } from "../lib/catalog";
import { BUCKETS } from "../lib/storage";
import { supabase } from "../lib/supabase";
import { mapSupabaseError } from "../lib/errors";
import { PremiumGate } from "./ui/PremiumGate";
import { extractProductFromImage } from "../lib/ai";
import { toast } from "sonner";

export default function ProductFormModal({
  open,
  product,
  salonId,
  onClose,
  onSaved,
}) {
  const editing = !!product?.id;
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const [image, setImage] = useState({ url: null, path: null });
  const [serverError, setServerError] = useState(null);
  const [extracting, setExtracting] = useState(false);

  const handleAIPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    try {
      const res = await extractProductFromImage(file);
      if (res.data) {
        reset({
          name: res.data.name,
          brand: res.data.brand,
          description: res.data.description,
          category: res.data.category,
          price_cents: res.data.price_cents / 100,
          currency: res.data.currency,
          recommended_for: res.data.recommended_for.join(", "),
          is_active: true
        });
        setImage({ url: res.data.image_url || null, path: null });
        toast.success("Atributos mágicamente extraídos ✨");
      }
    } finally {
      setExtracting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    reset({
      name: product?.name || "",
      brand: product?.brand || "",
      description: product?.description || "",
      category: product?.category || "Shampoo",
      price_cents: product?.price_cents != null ? product.price_cents / 100 : "",
      currency: product?.currency || CURRENCY_DEFAULT,
      recommended_for: (product?.recommended_for || []).join(", "),
      is_active: product?.is_active ?? true,
    });
    setImage({ url: product?.image_url || null, path: null });
    setServerError(null);
  }, [open, product, reset]);

  const isActive = watch("is_active");

  const onSubmit = async (values) => {
    setServerError(null);

    const priceRaw = values.price_cents;
    const priceNum = Number(priceRaw);
    if (priceRaw === "" || priceRaw == null || Number.isNaN(priceNum) || priceNum < 0) {
      setServerError("Precio inválido. Usa un número mayor o igual a 0.");
      return;
    }

    const recommendedArr = (values.recommended_for || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      salon_id: salonId,
      name: values.name.trim(),
      brand: values.brand?.trim() || null,
      description: values.description?.trim() || null,
      category: values.category,
      price_cents: Math.round(priceNum * 100),
      currency: values.currency || CURRENCY_DEFAULT,
      recommended_for: recommendedArr,
      image_url: image.url || null,
      is_active: !!values.is_active,
    };

    let res;
    try {
      const op = editing
        ? supabase.from("products").update(payload).eq("id", product.id).select().single()
        : supabase.from("products").insert(payload).select().single();
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
      title={editing ? "Editar producto" : "Nuevo producto"}
      subtitle="Cura los productos premium que recomiendas"
      testId="product-modal"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rm-btn-ghost"
            data-testid="product-cancel-btn"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="rm-btn-primary"
            data-testid="product-save-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Guardando…
              </>
            ) : editing ? (
              "Guardar cambios"
            ) : (
              "Crear producto"
            )}
          </button>
        </>
      }
    >
      <form
        id="product-form"
        onSubmit={handleSubmit(onSubmit)}
        className="grid md:grid-cols-2 gap-5"
      >
        <div className="md:col-span-2">
          <PremiumGate featureId="ai_product_extraction">
            <div className="bg-gradient-to-r from-magenta-500/5 to-violet-500/5 border border-magenta-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-display font-bold text-violet-900 dark:text-white flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-magenta-500" /> Autofill con IA
                </h4>
                <p className="text-sm text-violet-500 font-medium mt-0.5">Toma o sube una foto del producto y Roomie extraerá los atributos por ti.</p>
              </div>
              <label className={`rm-btn-primary px-5 py-2.5 text-sm text-center shadow-glow cursor-pointer relative overflow-hidden transition-all ease-in-out ${extracting ? 'opacity-80' : ''}`}>
                {extracting ? (
                  <span className="flex items-center gap-2 pr-4"><Loader2 className="w-4 h-4 animate-spin" /> Analizando magia...</span>
                ) : (
                  <span>Foto Mágica 📸</span>
                )}
                <input type="file" accept="image/*" className="absolute opacity-0 w-0 h-0 cursor-pointer" onChange={handleAIPhoto} disabled={extracting}/>
              </label>
            </div>
          </PremiumGate>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="rm-label">Nombre</label>
              <input
                type="text"
                className="rm-input"
                placeholder="Hydra Booster"
                data-testid="product-name-input"
                {...register("name", { required: true, minLength: 2 })}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-magenta-500">Requerido.</p>
              )}
            </div>
            <div>
              <label className="rm-label">Marca</label>
              <input
                type="text"
                className="rm-input"
                placeholder="Davines"
                data-testid="product-brand-input"
                {...register("brand")}
              />
            </div>
          </div>

          <div>
            <label className="rm-label">Descripción</label>
            <textarea
              rows={3}
              className="rm-input resize-none"
              placeholder="Sérum hidratante con ácido hialurónico…"
              data-testid="product-description-input"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="rm-label">Tipo</label>
              <select
                className="rm-input appearance-none cursor-pointer"
                data-testid="product-category-select"
                {...register("category", { required: true })}
              >
                {PRODUCT_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
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
                  data-testid="product-price-input"
                  {...register("price_cents", { required: true, min: 0 })}
                />
                <select
                  className="rm-input w-24"
                  data-testid="product-currency-select"
                  {...register("currency")}
                >
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="rm-label">Recomendado para</label>
            <input
              type="text"
              className="rm-input"
              placeholder="Cabello seco, puntas abiertas, color tratado"
              data-testid="product-recommended-input"
              {...register("recommended_for")}
            />
            <p className="mt-1 text-xs text-violet-400">
              Separa cada etiqueta con coma.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only"
              data-testid="product-active-toggle"
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
            bucket={BUCKETS.PRODUCTS}
            scopeId={salonId}
            value={image.url}
            onUploaded={({ url, path }) => setImage({ url, path })}
            onClear={() => setImage({ url: null, path: null })}
            label="Imagen del producto (opcional)"
            aspect="square"
            testId="product-image-uploader"
          />
        </div>

        {serverError && (
          <div
            className="md:col-span-2 flex items-start gap-2 rounded-2xl bg-magenta-500/10 border border-magenta-500/20 p-3 text-sm text-magenta-600"
            data-testid="product-error"
          >
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <p>{serverError}</p>
          </div>
        )}
      </form>
    </Modal>
  );
}
