import React, { useState } from 'react';
import { Download, X, Share, Plus, Sparkles } from 'lucide-react';
import usePWAInstall from '../hooks/usePWAInstall';
import { toast } from 'sonner';

/**
 * InstallPWAButton — surfaces the native PWA install flow with a luxury CTA.
 * - Chrome/Edge/Android: native `beforeinstallprompt` flow.
 * - iOS Safari: opens a soft modal explaining Share → Add to Home Screen.
 * - Hidden when already installed or user dismissed.
 *
 * Variants:
 *   - "card"    → full ambient card (used in ClientHome / SalonOverview)
 *   - "ghost"   → compact ghost button (used in headers / onboarding)
 *   - "pill"    → solid gradient pill (used in Landing CTA stack)
 */
export default function InstallPWAButton({ variant = 'card', className = '' }) {
  const { canInstall, showIOSHelp, isStandalone, dismissed, dismiss, promptInstall } =
    usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isStandalone) return null;
  if (dismissed && variant === 'card') return null;
  if (!canInstall && !showIOSHelp) return null;

  const handleClick = async () => {
    if (canInstall) {
      const res = await promptInstall();
      if (res.outcome === 'accepted') {
        toast.success('Roomie ahora vive en tu pantalla de inicio ✨');
      }
    } else if (showIOSHelp) {
      setShowIOSModal(true);
    }
  };

  // ------- VARIANT: card --------------------------------------------------
  if (variant === 'card') {
    return (
      <>
        <section
          className="relative overflow-hidden bg-gradient-to-br from-violet-100/60 via-white/60 to-magenta-50/60 rounded-3xl p-5 md:p-6 border border-white shadow-soft mt-2"
          data-testid="pwa-install-card"
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Cerrar"
            className="absolute top-3 right-3 text-violet-300 hover:text-violet-500 transition-colors"
            data-testid="pwa-install-dismiss"
          >
            <X size={16} />
          </button>
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-magenta-500 to-violet-500 text-white shadow-glow">
              <Sparkles size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-violet-400 font-bold mb-1">
                Tu Glow, siempre a un toque
              </p>
              <h3 className="font-display font-bold text-lg text-violet-900 leading-snug">
                Instala Roomie en tu pantalla de inicio
              </h3>
              <p className="text-sm text-violet-500 mt-1 leading-relaxed">
                {canInstall
                  ? 'Acceso instantáneo, modo offline y experiencia de app nativa.'
                  : 'En Safari: toca Compartir y luego "Añadir a inicio".'}
              </p>
              <button
                type="button"
                onClick={handleClick}
                className="rm-btn-primary mt-4 inline-flex items-center gap-2 text-sm"
                data-testid="pwa-install-cta"
              >
                <Download size={14} />
                Instalar Roomie
              </button>
            </div>
          </div>
        </section>
        {showIOSModal && <IOSInstallSheet onClose={() => setShowIOSModal(false)} />}
      </>
    );
  }

  // ------- VARIANT: ghost / pill -----------------------------------------
  const isGhost = variant === 'ghost';
  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={
          isGhost
            ? `inline-flex items-center gap-2 text-xs font-bold text-violet-600 bg-white/70 hover:bg-white border border-violet-100 px-3 py-1.5 rounded-full shadow-sm transition ${className}`
            : `rm-btn-primary inline-flex items-center gap-2 text-sm ${className}`
        }
        data-testid="pwa-install-cta"
      >
        <Download size={isGhost ? 12 : 14} />
        Instalar Roomie
      </button>
      {showIOSModal && <IOSInstallSheet onClose={() => setShowIOSModal(false)} />}
    </>
  );
}

function IOSInstallSheet({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-violet-900/30 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
      data-testid="pwa-ios-sheet"
    >
      <div
        className="rm-glass-strong rounded-3xl p-6 max-w-md w-full shadow-[0_20px_60px_rgba(124,82,170,0.25)] border border-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-violet-400 font-bold">
              Instalar en iOS
            </p>
            <h3 className="font-display font-bold text-xl text-violet-900">
              Añade Roomie a tu inicio
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-violet-400 hover:text-violet-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <ol className="space-y-3 mt-4">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs">
              1
            </span>
            <p className="text-sm text-violet-600 leading-relaxed">
              Toca el botón{' '}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-50 text-violet-700 font-semibold">
                <Share size={12} /> Compartir
              </span>{' '}
              en la barra inferior de Safari.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs">
              2
            </span>
            <p className="text-sm text-violet-600 leading-relaxed">
              Desplázate y elige{' '}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-50 text-violet-700 font-semibold">
                <Plus size={12} /> Añadir a inicio
              </span>
              .
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs">
              3
            </span>
            <p className="text-sm text-violet-600 leading-relaxed">
              Confirma con <span className="font-semibold text-magenta-500">Añadir</span> y Roomie quedará disponible como app nativa.
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
}
