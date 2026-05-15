import { useState } from "react";
import { Sparkles, Wand2, Loader2, AlertCircle } from "lucide-react";
import Modal from "./Modal";
import { BUCKETS, uploadImage } from "../lib/storage";

/**
 * "Roomie Logo Studio" — the UX hook for AI-generated salon logos.
 *
 * For now it doesn't call a real model: it renders a beautifully composed
 * gradient circle with the salon's monogram on a canvas, encodes it to PNG and
 * uploads it to Supabase Storage. The result is a real CDN-served logo the
 * owner can keep, which makes demos shine without burning model credits.
 *
 * When the real AI integration arrives, only `generate()` changes — the
 * surrounding UX, validation and storage handoff stay the same.
 */
const STYLE_PRESETS = [
  { key: "minimal", label: "Minimal", desc: "Limpio · serif elegante" },
  { key: "glam", label: "Glam", desc: "Brillante · femenino" },
  { key: "natural", label: "Natural", desc: "Suave · orgánico" },
  { key: "luxury", label: "Luxury", desc: "Premium · refinado" },
];

const PALETTES = [
  { key: "magenta", from: "#E040A0", to: "#7C52AA" },
  { key: "azure", from: "#4285F4", to: "#7C52AA" },
  { key: "sage", from: "#7CA982", to: "#4F7361" },
  { key: "nude", from: "#D4A574", to: "#8B5E3C" },
  { key: "noir", from: "#1F1F1F", to: "#444444" },
  { key: "rose", from: "#F472B6", to: "#E040A0" },
];

function monogramFor(name) {
  if (!name) return "R";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

async function renderLogoCanvas({ name, style, palette }) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, palette.from);
  grad.addColorStop(1, palette.to);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Soft inner glow ring
  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 22, 0, Math.PI * 2);
  ctx.stroke();

  // Monogram
  const fontWeight = style === "minimal" ? 500 : style === "luxury" ? 600 : 700;
  const fontFamily =
    style === "luxury"
      ? "'Manrope', 'Times New Roman', serif"
      : "'Manrope', system-ui, sans-serif";
  ctx.fillStyle = "white";
  ctx.font = `${fontWeight} 220px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 14;
  ctx.fillText(monogramFor(name), size / 2, size / 2 + 14);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 0.92);
  });
}

export default function AILogoModal({
  open,
  onClose,
  initialName = "",
  scopeId,
  onGenerated,
}) {
  const [name, setName] = useState(initialName);
  const [style, setStyle] = useState("minimal");
  const [paletteKey, setPaletteKey] = useState("magenta");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const palette = PALETTES.find((p) => p.key === paletteKey) || PALETTES[0];

  const generate = async () => {
    setError(null);
    setBusy(true);
    try {
      const blob = await renderLogoCanvas({
        name: name || initialName,
        style,
        palette,
      });
      if (!blob) throw new Error("No pudimos renderizar el logo.");
      const localUrl = URL.createObjectURL(blob);
      setPreviewUrl(localUrl);
    } catch (e) {
      setError(e.message || "Algo salió mal generando el logo.");
    } finally {
      setBusy(false);
    }
  };

  const useThis = async () => {
    if (!previewUrl) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await renderLogoCanvas({
        name: name || initialName,
        style,
        palette,
      });
      const file = new File([blob], "ai-logo.png", { type: "image/png" });
      const { url, path, error: upErr } = await uploadImage({
        bucket: BUCKETS.SALON_LOGOS,
        scopeId: scopeId || "draft",
        file,
      });
      if (upErr) throw upErr;
      onGenerated?.({ url, path });
      onClose?.();
    } catch (e) {
      setError(e.message || "No pudimos guardar el logo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Roomie Logo Studio"
      subtitle="Genera una identidad visual al instante (versión de demostración)"
      testId="ai-logo-modal"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rm-btn-ghost"
            data-testid="ai-logo-cancel"
          >
            Cancelar
          </button>
          {previewUrl ? (
            <button
              type="button"
              onClick={useThis}
              disabled={busy}
              className="rm-btn-primary"
              data-testid="ai-logo-use"
            >
              {busy ? "Guardando…" : "Usar este logo"}
              {!busy && <Sparkles size={16} />}
            </button>
          ) : (
            <button
              type="button"
              onClick={generate}
              disabled={busy || !name.trim()}
              className="rm-btn-primary"
              data-testid="ai-logo-generate"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generando…
                </>
              ) : (
                <>
                  <Wand2 size={16} /> Generar
                </>
              )}
            </button>
          )}
        </>
      }
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="rm-label">Nombre del salón</label>
            <input
              type="text"
              className="rm-input"
              placeholder="Aurora Beauty Lab"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="ai-logo-name"
            />
          </div>

          <div>
            <label className="rm-label">Estilo visual</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStyle(s.key)}
                  data-testid={`ai-logo-style-${s.key}`}
                  className={`text-left rounded-2xl px-3 py-2 border transition-all ${
                    style === s.key
                      ? "bg-white/85 border-magenta-500/40 shadow-soft"
                      : "bg-white/40 border-violet-100 hover:bg-white/70"
                  }`}
                >
                  <p className="text-sm font-semibold text-violet-900">{s.label}</p>
                  <p className="text-xs text-violet-400">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="rm-label">Paleta</label>
            <div className="grid grid-cols-6 gap-2">
              {PALETTES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPaletteKey(p.key)}
                  data-testid={`ai-logo-palette-${p.key}`}
                  className={`aspect-square rounded-2xl transition-all ${
                    paletteKey === p.key
                      ? "ring-2 ring-magenta-500/60 scale-105"
                      : "ring-1 ring-white/70 hover:scale-105"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)`,
                  }}
                  aria-label={p.key}
                />
              ))}
            </div>
          </div>

          <p className="text-[11px] text-violet-400 leading-relaxed">
            Estamos en versión de demostración. La generación con modelos
            avanzados de IA estará disponible próximamente.
          </p>
        </div>

        <div>
          <div className="aspect-square rounded-3xl bg-white/40 border border-white/70 shadow-soft flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="logo preview"
                className="w-full h-full object-cover"
                data-testid="ai-logo-preview"
              />
            ) : (
              <div className="text-center px-4">
                <span className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-400 via-violet-500 to-magenta-500 text-white shadow-glow animate-float mb-3">
                  <Sparkles size={26} />
                </span>
                <p className="text-violet-700 font-semibold">Tu logo aparecerá aquí</p>
                <p className="text-xs text-violet-400 mt-1">
                  Pulsa "Generar" para crear una propuesta.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div
              className="mt-4 flex items-start gap-2 rounded-2xl bg-magenta-500/10 border border-magenta-500/20 p-3 text-sm text-magenta-600"
              data-testid="ai-logo-error"
            >
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
