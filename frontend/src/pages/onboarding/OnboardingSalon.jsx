import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Sparkles,
  AlertCircle,
  ArrowRight,
  Store,
  Link as LinkIcon,
  Image as ImageIcon,
  MessageCircle,
} from "lucide-react";
import Logo from "../../components/Logo";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

const COLOR_PRESETS = [
  { name: "Magenta", primary: "#E040A0", secondary: "#7C52AA" },
  { name: "Violet", primary: "#7C52AA", secondary: "#4285F4" },
  { name: "Azure", primary: "#4285F4", secondary: "#7C52AA" },
  { name: "Sage", primary: "#7CA982", secondary: "#4F7361" },
  { name: "Nude", primary: "#D4A574", secondary: "#8B5E3C" },
  { name: "Noir", primary: "#1F1F1F", secondary: "#444444" },
];

const TONE_OPTIONS = ["alegre", "calmada", "profesional", "intima"];
const STYLE_OPTIONS = ["emocional", "minimal", "lujo", "amigable"];
const EMOJI_LEVEL_OPTIONS = ["off", "low", "medium", "high"];
const SALES_STYLE_OPTIONS = ["soft_luxury", "concierge", "direct", "consultivo"];

function slugify(value) {
  return (value || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export default function OnboardingSalon() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      slug: "",
      logo_url: "",
      whatsapp_number: "",
      primary_color: COLOR_PRESETS[0].primary,
      secondary_color: COLOR_PRESETS[0].secondary,
      tone: "alegre",
      style: "emocional",
      emoji_level: "medium",
      sales_style: "soft_luxury",
    },
  });

  const [serverError, setServerError] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const nameValue = watch("name");
  const primary = watch("primary_color");
  const secondary = watch("secondary_color");

  // Auto-update slug as the user types the name (until they edit it manually).
  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, slugTouched, setValue]);

  const previewGradient = useMemo(
    () => `linear-gradient(135deg, ${secondary} 0%, ${primary} 100%)`,
    [primary, secondary]
  );

  const applyPreset = (preset) => {
    setValue("primary_color", preset.primary, { shouldDirty: true });
    setValue("secondary_color", preset.secondary, { shouldDirty: true });
  };

  const onSubmit = async (values) => {
    setServerError(null);
    const roomie_personality = {
      tone: values.tone,
      style: values.style,
      emoji_level: values.emoji_level,
      sales_style: values.sales_style,
    };

    const { error } = await supabase.rpc("create_my_salon", {
      p_name: values.name.trim(),
      p_slug: slugify(values.slug || values.name),
      p_primary_color: values.primary_color,
      p_secondary_color: values.secondary_color,
      p_logo_url: values.logo_url?.trim() || null,
      p_whatsapp_number: values.whatsapp_number?.trim() || null,
      p_roomie_personality: roomie_personality,
    });

    if (error) {
      const msg = error.message || "";
      let friendly = msg;
      if (msg.includes("OWNER_ALREADY_HAS_SALON")) {
        friendly =
          "Ya tienes un salón asignado. Recarga la página o cierra sesión y vuelve a entrar.";
      } else if (msg.includes("ONLY_SALON_OWNER_CAN_CREATE_SALON")) {
        friendly = "Tu cuenta no tiene permisos para crear un salón.";
      } else if (msg.includes("SLUG_TOO_SHORT")) {
        friendly = "La URL del salón es demasiado corta. Usa al menos 3 caracteres.";
      } else if (msg.includes("NAME_REQUIRED")) {
        friendly = "El nombre del salón es obligatorio.";
      } else if (msg.includes("duplicate key") || msg.includes("salons_slug_key")) {
        friendly =
          "Esa URL ya está en uso por otro salón. Elige una variante única.";
      }
      setServerError(friendly);
      return;
    }

    await refreshProfile();
    navigate("/salon", { replace: true });
  };

  return (
    <div
      className="min-h-screen rm-bg-aurora px-4 py-10 md:py-14"
      data-testid="onboarding-salon-page"
    >
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <Logo size="md" />
          <span className="rm-chip mt-6 mx-auto">
            <Sparkles size={12} className="text-magenta-500" />
            Onboarding · paso 1 de 1
          </span>
          <h1 className="mt-3 font-display font-extrabold text-3xl md:text-4xl text-violet-900 tracking-tight">
            Hola {profile?.full_name?.split(" ")[0] || "creadora"} ·{" "}
            <span className="rm-text-gradient">crea tu salón</span>
          </h1>
          <p className="mt-2 text-violet-500 max-w-lg mx-auto">
            Define la identidad de tu espacio. Podrás afinar todo después, pero
            esto sembrará la personalidad de tu Roomie.
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          data-testid="onboarding-form"
        >
          {/* Identity */}
          <section className="rm-glass-strong rounded-[2rem] p-6 md:p-8 animate-scale-in">
            <h2 className="font-display font-bold text-lg text-violet-900 mb-5">
              Identidad
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="rm-label">Nombre del salón</label>
                <div className="relative">
                  <Store
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300"
                  />
                  <input
                    type="text"
                    autoComplete="organization"
                    placeholder="Aurora Beauty Lab"
                    data-testid="onboarding-name-input"
                    className="rm-input pl-11"
                    {...register("name", { required: true, minLength: 2 })}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-magenta-500">
                    El nombre es obligatorio (mínimo 2 caracteres).
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="rm-label">URL de tu salón</label>
                <div className="relative">
                  <LinkIcon
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300"
                  />
                  <input
                    type="text"
                    placeholder="aurora-beauty-lab"
                    data-testid="onboarding-slug-input"
                    className="rm-input pl-11 lowercase tracking-tight"
                    {...register("slug", {
                      required: true,
                      minLength: 3,
                      onChange: () => setSlugTouched(true),
                    })}
                  />
                </div>
                <p className="mt-1 text-xs text-violet-400">
                  roomie.app/<span className="font-semibold">{watch("slug") || "tu-salon"}</span>
                </p>
                {errors.slug && (
                  <p className="mt-1 text-xs text-magenta-500">
                    Usa mínimo 3 caracteres (letras, números y guiones).
                  </p>
                )}
              </div>

              <div>
                <label className="rm-label">Logo (URL, opcional)</label>
                <div className="relative">
                  <ImageIcon
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300"
                  />
                  <input
                    type="url"
                    placeholder="https://…"
                    data-testid="onboarding-logo-input"
                    className="rm-input pl-11"
                    {...register("logo_url")}
                  />
                </div>
              </div>

              <div>
                <label className="rm-label">WhatsApp (opcional)</label>
                <div className="relative">
                  <MessageCircle
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300"
                  />
                  <input
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    data-testid="onboarding-whatsapp-input"
                    className="rm-input pl-11"
                    {...register("whatsapp_number")}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Visual identity */}
          <section className="rm-glass-strong rounded-[2rem] p-6 md:p-8 animate-scale-in">
            <h2 className="font-display font-bold text-lg text-violet-900">
              Paleta visual
            </h2>
            <p className="text-violet-500 text-sm mt-1">
              Tu salón heredará estos colores en toda la app.
            </p>

            <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-3">
              {COLOR_PRESETS.map((preset) => {
                const selected =
                  preset.primary === primary && preset.secondary === secondary;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    data-testid={`onboarding-preset-${preset.name.toLowerCase()}`}
                    className={`group flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
                      selected
                        ? "bg-white/80 shadow-soft scale-[1.02]"
                        : "hover:bg-white/50"
                    }`}
                  >
                    <span
                      className="block w-full aspect-square rounded-2xl shadow-pill ring-2 ring-white/70"
                      style={{
                        background: `linear-gradient(135deg, ${preset.secondary} 0%, ${preset.primary} 100%)`,
                      }}
                    />
                    <span
                      className={`text-[11px] font-semibold ${
                        selected ? "text-violet-900" : "text-violet-500"
                      }`}
                    >
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <div>
                <label className="rm-label">Color principal</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    data-testid="onboarding-primary-color"
                    className="h-11 w-14 rounded-2xl border border-violet-100 bg-white/70 cursor-pointer"
                    {...register("primary_color")}
                  />
                  <input
                    type="text"
                    className="rm-input flex-1 uppercase tracking-wide font-mono text-sm"
                    {...register("primary_color", {
                      pattern: /^#([0-9A-Fa-f]{6})$/,
                    })}
                  />
                </div>
              </div>
              <div>
                <label className="rm-label">Color secundario</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    data-testid="onboarding-secondary-color"
                    className="h-11 w-14 rounded-2xl border border-violet-100 bg-white/70 cursor-pointer"
                    {...register("secondary_color")}
                  />
                  <input
                    type="text"
                    className="rm-input flex-1 uppercase tracking-wide font-mono text-sm"
                    {...register("secondary_color", {
                      pattern: /^#([0-9A-Fa-f]{6})$/,
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Live preview */}
            <div
              className="mt-5 rounded-3xl p-6 text-white shadow-glow"
              style={{ background: previewGradient }}
              data-testid="onboarding-preview"
            >
              <p className="text-xs uppercase tracking-widest opacity-80">
                Vista previa
              </p>
              <p className="mt-1 font-display font-extrabold text-2xl">
                {watch("name") || "Tu salón"}
              </p>
              <p className="text-sm opacity-90">
                roomie.app/{watch("slug") || "tu-salon"}
              </p>
            </div>
          </section>

          {/* Personality */}
          <section className="rm-glass-strong rounded-[2rem] p-6 md:p-8 animate-scale-in">
            <h2 className="font-display font-bold text-lg text-violet-900">
              Voz de Roomie
            </h2>
            <p className="text-violet-500 text-sm mt-1">
              Define cómo se expresa tu concierge digital. Lo refinaremos cuando
              integremos la IA.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <PersonalitySelect
                label="Tono"
                name="tone"
                options={TONE_OPTIONS}
                register={register}
                testId="onboarding-tone"
              />
              <PersonalitySelect
                label="Estilo"
                name="style"
                options={STYLE_OPTIONS}
                register={register}
                testId="onboarding-style"
              />
              <PersonalitySelect
                label="Nivel de emojis"
                name="emoji_level"
                options={EMOJI_LEVEL_OPTIONS}
                register={register}
                testId="onboarding-emoji-level"
              />
              <PersonalitySelect
                label="Estilo de venta"
                name="sales_style"
                options={SALES_STYLE_OPTIONS}
                register={register}
                testId="onboarding-sales-style"
              />
            </div>
          </section>

          {serverError && (
            <div
              className="flex items-start gap-2 rounded-2xl bg-magenta-500/10 border border-magenta-500/20 p-4 text-sm text-magenta-600"
              data-testid="onboarding-error"
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>{serverError}</p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <p className="text-xs text-violet-400">
              Podrás editar todo esto después en los ajustes del salón.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="onboarding-submit-btn"
              className="rm-btn-primary"
            >
              {isSubmitting ? "Creando tu salón…" : "Crear salón"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PersonalitySelect({ label, name, options, register, testId }) {
  return (
    <div>
      <label className="rm-label">{label}</label>
      <div className="relative">
        <select
          data-testid={testId}
          className="rm-input pr-10 appearance-none cursor-pointer capitalize"
          {...register(name, { required: true })}
        >
          {options.map((o) => (
            <option key={o} value={o} className="capitalize">
              {o.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-violet-400 text-xs">
          ▼
        </span>
      </div>
    </div>
  );
}
