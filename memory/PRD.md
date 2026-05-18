# Roomie Experience — PRD (Live)

## Problem statement (latest)
Sprint final de preparación para demo pública de Roomie Experience. Cerrar AI Studio real,
PWA Install, First-Time Tutorial y UX polish para presentación de mañana, sin tocar la
arquitectura core ni el schema Supabase.

## Stack (frozen)
- **Frontend**: React 18 + Vite 8 + Tailwind 3 + Manrope + Framer Motion + lucide-react + sonner + i18next
- **Backend (real)**: Supabase (Auth + Postgres + RLS + Storage) — proyecto `dxfqnwdwqmuyyzpdlgcl`
- **Backend stub**: FastAPI (solo `/api/health`) — Supabase-first
- **AI**: OpenRouter (`google/gemini-2.5-flash`, `anthropic/claude-sonnet-4.5`, `anthropic/claude-opus-4`, `meta-llama/llama-3.3-70b-instruct:free`)

## Personas
1. **Clienta premium** — busca curaduría, Glow Journey y reservas frictionless.
2. **Salón premium** — busca branding emocional + concierge AI + catálogo curado.
3. **Admin** — observabilidad y soporte.

## Implemented (Feb 2026 freeze + Sprint final · 2026-05-18)
- ✅ Migración total a Vite (sin `process.env`, todo via `import.meta.env.VITE_*`).
- ✅ Supabase real conectado (signup/login E2E verificados).
- ✅ OpenRouter real conectado con 4 modelos verificados.
- ✅ **AI Studio Real** — modal premium con tarjetas + meters (velocidad / calidad / costo) + temperature slider + persistencia (localStorage `roomie_ai_model`).
- ✅ Modelo activo visible y clicable en footer del Roomie Chat (abre AI Studio).
- ✅ **PWA Install Experience** — hook `usePWAInstall` que escucha `beforeinstallprompt`, componente `InstallPWAButton` con variantes `card` / `ghost` / `pill`, modal iOS con instrucciones, dismiss persistente.
- ✅ **First-Time Tutorial** — 3 pasos por rol (client / salon), variants cinemáticos, progress dots, skip persistente en localStorage (`roomie.tutorial.seen.<role>`).
- ✅ UX polish — `Skeleton` con variante `avatar` + `label` emocional, `EmptyState` con `tone` whisper opcional.
- ✅ Landing con CTA de instalación inline.
- ✅ ClientHome + SalonOverview muestran InstallPWAButton en variant card.

## Files added in sprint
- `frontend/src/hooks/usePWAInstall.js`
- `frontend/src/components/InstallPWAButton.jsx`
- `frontend/src/components/FirstTimeTutorial.jsx`

## Files modified in sprint
- `frontend/src/lib/ai/openrouter.js` — metadatos visuales (speed/quality/badge/tagline/accent)
- `frontend/src/components/AIStudioConfigurator.jsx` — rediseño premium
- `frontend/src/components/AppShell.jsx` — montaje del tutorial
- `frontend/src/pages/chat/RoomieChat.jsx` — footer clicable con modelo activo
- `frontend/src/pages/client/ClientHome.jsx` — InstallPWAButton card
- `frontend/src/pages/salon/SalonOverview.jsx` — InstallPWAButton card
- `frontend/src/pages/Landing.jsx` — InstallPWAButton ghost
- `frontend/src/components/Skeleton.jsx` — variante avatar + label
- `frontend/src/components/EmptyState.jsx` — tone whisper

## Verified for demo
- ✅ Build de producción limpio: `yarn build` (Vite 8.0.13) en 1.24 s; bundle 187 KB gzip.
- ✅ Lint ESLint: 0 errores en `components/`, `pages/`, `lib/`, `hooks/`.
- ✅ Preview público HTTPS responde 200.
- ✅ Signup real → Supabase: `POST /auth/v1/signup` + `POST /rest/v1/profiles` ambos 200.
- ✅ Chat real con Gemini 2.5 Flash y Claude Sonnet 4.5 (cambio dinámico de modelo persistido).
- ✅ Tutorial dispara solo la primera vez, skip-able, persiste flag.

## Bug fixes (post sprint final)
- ✅ **[2026-05-18] Onboarding salón loop bug**: race condition entre `refreshProfile()` fire-and-forget + `TOKEN_REFRESHED` en `onAuthStateChange` sobreescribía `applyLocalProfile` con `salon_id=null`, causando redirect loop. Fix: (1) removido `refreshProfile()` de `OnboardingSalon.onSubmit`, (2) TOKEN_REFRESHED skipeado en `onAuthStateChange`, (3) smart merge en `refreshProfile` preserva `salon_id`. Verificado 5/5 con testing agent.

## Backlog post-demo
- **P1**: Edge Functions (Vision real, Logo Studio real, Product Extraction, Service Suggestions) según AI_ROADMAP.md.
- **P1**: Stripe real reemplazando Apple Pay mock (`CheckoutMockModal`).
- **P2**: Migrar Memory Lite de localStorage a tabla `client_profiles`.
- **P2**: PWA icons reales (reemplazar `emoji-roomie.jpg` por logos brand).
- **P2**: Auto-routing de tokens (suprimir toggle manual; ruteo en Edge Function).

_Last update: 2026-05-18 — Sprint final · demo-ready._
