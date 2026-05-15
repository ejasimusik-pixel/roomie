import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Camera,
  Wand2,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { BUCKETS, uploadImage } from "../../lib/storage";
import GlassCard from "../../components/GlassCard";

/**
 * Roomie Vision — UX hook for the future AI visual consultation.
 *
 * Flow today:
 *   1. The client uploads a selfie (private bucket `client-uploads`).
 *   2. We render a "preparing your look" sequence with luxury copy.
 *   3. We show a mocked premium proposal (look, color, makeup, mood).
 *
 * Real OpenRouter / multimodal pipeline will replace the `generateProposal()`
 * mock without touching the surrounding UI.
 */

const LOOKS = [
  {
    key: "soft-blonde",
    title: "Soft Honey Balayage",
    palette: ["#E8C39E", "#C28B5B", "#7C4A2B"],
    notes: "Mechas suaves para iluminar tu rostro sin perder profundidad.",
  },
  {
    key: "rose-bronde",
    title: "Rose Bronde",
    palette: ["#D89A8A", "#A86A55", "#582E25"],
    notes: "Calidez rosada y dimensión natural en cabello a media altura.",
  },
  {
    key: "clean-noir",
    title: "Clean Noir + Glass Skin",
    palette: ["#1F1A24", "#574B66", "#E9DCEB"],
    notes: "Mirada minimal, piel hidratada, contraste limpio.",
  },
];

function pickLook() {
  return LOOKS[Math.floor(Math.random() * LOOKS.length)];
}

async function generateProposal() {
  // MOCKED — purposefully delayed to feel premium. Replace with real model call later.
  await new Promise((r) => setTimeout(r, 1600));
  return {
    look: pickLook(),
    manicure: "Soft Almond · acabado satinado nude",
    makeup: "Glass skin · labio nude tibio · cejas peinadas",
    mood: "Calmada, elegante, luminosa",
  };
}

export default function Vision() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("upload"); // upload | processing | result
  const [photo, setPhoto] = useState(null); // { url, path }
  const [proposal, setProposal] = useState(null);
  const [error, setError] = useState(null);

  const onFile = useCallback(
    async (file) => {
      setError(null);
      if (!user?.id) {
        setError("Inicia sesión para usar Roomie Vision.");
        return;
      }
      const { url, path, error: e } = await uploadImage({
        bucket: BUCKETS.CLIENT_UPLOADS,
        scopeId: user.id,
        file,
      });
      if (e) {
        setError(e.message || "No pudimos subir tu foto.");
        return;
      }
      setPhoto({ url, path });
      setStep("processing");
      const p = await generateProposal();
      setProposal(p);
      setStep("result");
    },
    [user]
  );

  const restart = () => {
    setStep("upload");
    setPhoto(null);
    setProposal(null);
    setError(null);
  };

  const heroGradient = useMemo(() => {
    if (!proposal) return "linear-gradient(135deg, #4285F4, #7C52AA, #E040A0)";
    const [a, b, c] = proposal.look.palette;
    return `linear-gradient(135deg, ${a} 0%, ${b} 55%, ${c} 100%)`;
  }, [proposal]);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="vision-page">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-2xl bg-white/60 text-violet-700 hover:bg-white/85 transition-colors"
            aria-label="Volver"
            data-testid="vision-back-btn"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest">
              Premium
            </p>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-violet-900 tracking-tight">
              <span className="rm-text-gradient">Roomie Vision</span>
            </h1>
          </div>
        </div>
        <span className="rm-chip" data-testid="vision-beta-chip">
          <Sparkles size={11} className="text-magenta-500" /> Beta
        </span>
      </header>

      {step === "upload" && (
        <GlassCard className="text-center" hoverable={false} testId="vision-upload">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-400 via-violet-500 to-magenta-500 text-white shadow-glow mb-4">
            <Wand2 size={26} />
          </span>
          <h2 className="font-display font-bold text-xl text-violet-900">
            Tu próxima versión, imaginada por Roomie
          </h2>
          <p className="mt-2 text-violet-500 max-w-md mx-auto text-sm leading-relaxed">
            Sube una selfie y nuestro concierge visual te propondrá un look
            completo: color de cabello, manicura, maquillaje y mood.
          </p>

          <label
            className="rm-btn-primary mt-6 inline-flex cursor-pointer"
            data-testid="vision-upload-btn"
          >
            <Camera size={16} /> Subir selfie
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
              data-testid="vision-file-input"
            />
          </label>

          <p className="mt-4 text-[11px] text-violet-400 max-w-xs mx-auto">
            Tus fotos son privadas. Sólo tú y Roomie pueden verlas.
          </p>

          {error && (
            <div
              className="mt-4 inline-flex items-center gap-2 text-sm text-magenta-600"
              data-testid="vision-error"
            >
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </GlassCard>
      )}

      {step === "processing" && (
        <GlassCard
          className="text-center"
          hoverable={false}
          testId="vision-processing"
        >
          <Loader2 className="animate-spin text-violet-500 mx-auto" size={36} />
          <h2 className="mt-4 font-display font-bold text-xl text-violet-900">
            Preparando tu propuesta…
          </h2>
          <p className="mt-2 text-violet-500 text-sm">
            Esto es una versión de demostración. La generación con modelos
            multimodales llegará pronto.
          </p>
        </GlassCard>
      )}

      {step === "result" && proposal && (
        <div
          className="grid lg:grid-cols-5 gap-4 animate-slide-up"
          data-testid="vision-result"
        >
          <GlassCard
            className="lg:col-span-2 !p-0 overflow-hidden"
            hoverable={false}
          >
            <div
              className="aspect-[3/4] flex items-end p-5"
              style={{ background: heroGradient }}
            >
              {photo?.url ? (
                <img
                  src={photo.url}
                  alt="Tu selfie"
                  className="w-full h-full object-cover rounded-2xl shadow-glow"
                />
              ) : null}
            </div>
          </GlassCard>

          <GlassCard className="lg:col-span-3" hoverable={false}>
            <span className="rm-chip">
              <Sparkles size={11} className="text-magenta-500" /> Propuesta visual
            </span>
            <h2 className="mt-3 font-display font-extrabold text-2xl text-violet-900">
              {proposal.look.title}
            </h2>
            <p className="mt-1 text-violet-500">{proposal.look.notes}</p>

            <div className="mt-4 flex items-center gap-2">
              {proposal.look.palette.map((c) => (
                <span
                  key={c}
                  className="w-9 h-9 rounded-2xl shadow-soft ring-1 ring-white/70"
                  style={{ background: c }}
                  title={c}
                />
              ))}
              <span className="ml-2 text-xs text-violet-400 font-mono">
                paleta del look
              </span>
            </div>

            <div className="rm-divider my-5" />

            <dl className="space-y-3 text-sm">
              <div className="flex gap-2">
                <dt className="text-violet-400 w-24 flex-shrink-0">Manicura</dt>
                <dd className="text-violet-900 font-medium">{proposal.manicure}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-violet-400 w-24 flex-shrink-0">Maquillaje</dt>
                <dd className="text-violet-900 font-medium">{proposal.makeup}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-violet-400 w-24 flex-shrink-0">Mood</dt>
                <dd className="text-violet-900 font-medium">{proposal.mood}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <button
                onClick={restart}
                className="rm-btn-ghost"
                data-testid="vision-restart"
              >
                Otra propuesta
              </button>
              <button
                onClick={() => navigate("/app/discover")}
                className="rm-btn-primary"
                data-testid="vision-cta-book"
              >
                Reservar en un salón
              </button>
            </div>

            <p className="mt-4 text-[11px] text-violet-400 leading-relaxed">
              Versión de demostración. Las propuestas con IA multimodal estarán
              disponibles próximamente.
            </p>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
