import { useEffect, useState, useCallback } from 'react';

/**
 * usePWAInstall — detects `beforeinstallprompt` and exposes:
 *   - canInstall: boolean (Chrome/Edge/Android only, after prompt is captured)
 *   - isStandalone: boolean (already installed / running as PWA)
 *   - isIOS: boolean (Safari iOS needs manual instructions)
 *   - promptInstall(): trigger the native install dialog
 *   - dismiss(): hide CTA for the session (persisted to localStorage)
 *   - dismissed: boolean
 */
const DISMISS_KEY = 'roomie.pwa.install.dismissed';

export default function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1'
  );

  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true);

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream;

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const installedHandler = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return { outcome: 'unavailable' };
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === 'accepted') setInstalled(true);
    return choice;
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }, []);

  const canInstall = Boolean(deferredPrompt) && !installed && !isStandalone;

  // iOS: surface the CTA so we can show manual instructions
  const showIOSHelp = isIOS && !isStandalone && !installed;

  return {
    canInstall,
    showIOSHelp,
    isStandalone: isStandalone || installed,
    isIOS,
    dismissed,
    dismiss,
    promptInstall,
  };
}
