import React, { useEffect, useState } from 'react';
import { Sparkles, MessageCircleHeart, Wand2, Crown, Scissors, LayoutDashboard, ArrowRight, X } from 'lucide-react';

const STORAGE_PREFIX = 'roomie.tutorial.seen';

const CLIENT_STEPS = [
  {
    eyebrow: 'Bienvenida',
    title: 'Tu Glow Journey empieza aquí',
    body: 'Roomie es tu acompañante de belleza. Curado, cálido, siempre a tu ritmo. Te guía sin gritar.',
    icon: Sparkles,
    accent: 'from-magenta-200 via-pink-100 to-white',
    iconColor: 'text-magenta-500',
  },
  {
    eyebrow: 'Concierge',
    title: 'Charla con Roomie cuando quieras',
    body: 'Pídele un look para el brunch, una rutina express o sube una foto y deja que te inspire en segundos.',
    icon: MessageCircleHeart,
    accent: 'from-violet-200 via-violet-100 to-white',
    iconColor: 'text-violet-500',
  },
  {
    eyebrow: 'Vision',
    title: 'Tu espejo inteligente',
    body: 'Sube una selfie y Roomie propone color, corte, manicura y maquillaje pensados solo para ti.',
    icon: Wand2,
    accent: 'from-sky-200 via-sky-100 to-white',
    iconColor: 'text-sky-500',
  },
];

const SALON_STEPS = [
  {
    eyebrow: 'Bienvenida',
    title: 'Tu salón, elevado',
    body: 'Roomie es tu Beauty Business OS. Catálogo curado, branding emocional y un concierge entrenado en tu voz.',
    icon: Crown,
    accent: 'from-magenta-200 via-pink-100 to-white',
    iconColor: 'text-magenta-500',
  },
  {
    eyebrow: 'Catálogo',
    title: 'Servicios y productos en minutos',
    body: 'Crea tu menú premium con un toque cinemático. Roomie aprende de ti para sugerir lo que falta.',
    icon: Scissors,
    accent: 'from-violet-200 via-violet-100 to-white',
    iconColor: 'text-violet-500',
  },
  {
    eyebrow: 'AI Business',
    title: 'Un cerebro estratégico a tu lado',
    body: 'Naming, bundles, upselling y copy listos en segundos. Tu Roomie redacta con el tono que elegiste.',
    icon: LayoutDashboard,
    accent: 'from-sky-200 via-sky-100 to-white',
    iconColor: 'text-sky-500',
  },
];

export default function FirstTimeTutorial({ role }) {
  const storageKey = `${STORAGE_PREFIX}.${role || 'client'}`;
  const steps = role === 'salon_owner' ? SALON_STEPS : CLIENT_STEPS;

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!role) return;
    if (role === 'admin') return; // no tutorial for admins
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      // tiny delay so the page renders first
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [role, storageKey]);

  const close = (skipped = false) => {
    localStorage.setItem(storageKey, skipped ? 'skipped' : 'done');
    setOpen(false);
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else close(false);
  };

  if (!open || !role || role === 'admin') return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-violet-900/30 backdrop-blur-sm p-4 animate-fade-in"
      data-testid="first-time-tutorial"
    >
      <div className="relative w-full max-w-md rm-glass-strong rounded-3xl shadow-[0_30px_80px_rgba(124,82,170,0.25)] border border-white overflow-hidden">
        {/* Accent backdrop */}
        <div
          className={`absolute inset-x-0 top-0 h-44 bg-gradient-to-br ${current.accent} opacity-80 pointer-events-none`}
        />

        {/* Skip */}
        <button
          type="button"
          onClick={() => close(true)}
          className="absolute top-4 right-4 z-10 text-violet-400 hover:text-violet-700 transition-colors flex items-center gap-1 text-xs font-semibold"
          data-testid="tutorial-skip"
        >
          Omitir <X size={14} />
        </button>

        {/* Content */}
        <div className="relative p-7 md:p-8">
          <span
            className={`inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-white shadow-soft ring-1 ring-violet-100 mb-5 ${current.iconColor}`}
          >
            <Icon size={26} strokeWidth={1.7} />
          </span>

          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-400 mb-2">
            {current.eyebrow}
          </p>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-violet-900 leading-tight mb-3">
            {current.title}
          </h2>
          <p className="text-violet-600/90 text-sm md:text-base leading-relaxed">
            {current.body}
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mt-7" data-testid="tutorial-progress">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? 'w-8 bg-gradient-to-r from-magenta-500 to-violet-500'
                    : i < step
                    ? 'w-3 bg-violet-300'
                    : 'w-3 bg-violet-100'
                }`}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => close(true)}
              className="text-xs font-bold text-violet-400 hover:text-violet-700 transition-colors uppercase tracking-widest"
            >
              Saltar tour
            </button>
            <button
              type="button"
              onClick={next}
              className="rm-btn-primary inline-flex items-center gap-2 text-sm"
              data-testid="tutorial-next"
            >
              {isLast ? 'Empezar' : 'Siguiente'}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
