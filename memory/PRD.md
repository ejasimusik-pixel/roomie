# ROOMIE — Personal Care & Wellbeing
## Product Requirements Document (PRD)

> Plataforma SaaS PWA premium de belleza impulsada por IA para salones high-ticket.

---

### Original Problem Statement (verbatim)
Crear la arquitectura base de una plataforma SaaS PWA llamada ROOMIE.

- Stack: Supabase (Auth + PostgreSQL + Storage), arquitectura PWA, mobile-first responsive.
- Diseño: Luxury Minimal, Glassmorphism, Manrope, gradientes pastel (rosa #f9a8d4, azul #4285F4).
- Roles: `client`, `salon_owner`, `admin`.
- Páginas: Landing, Auth, Dashboard cliente, Workspace salón, Panel admin.
- Login: Google OAuth + email/password.
- Multi-tenant: todas las entidades llevarán `salon_id`.
- Rutas protegidas por rol.
- **NO implementar todavía**: IA real, pagos, promo codes.

---

### Architecture
- **Frontend**: React 18 (CRA), `react-router-dom` v6, `@supabase/supabase-js` v2, `react-i18next`, `react-hook-form`, `lucide-react`, Tailwind 3. PWA-ready.
- **Backend**: 100% Supabase (PostgreSQL + Auth + RLS + Storage). `/app/backend/server.py` es sólo un health-stub.
- **Auth**: Supabase client desde el browser.
- **Multi-tenant**: tabla `salons` como raíz; todas las tablas derivadas llevan `salon_id`.
- **RLS activo desde el primer día** con dos helpers `security definer` (`current_role()`, `current_salon_id()`).
- **i18n**: Español por defecto.

### File Layout (frontend)
```
src/
├── lib/{supabase.js, storage.js, catalog.js, ai.js, i18n.js, errors.js}
├── context/AuthContext.jsx
├── components/{Logo, AppShell, Sidebar, TopBar, BottomNav, ProtectedRoute, GlassCard, ImageUploader, AILogoModal, Modal, ...}
└── pages/
    ├── Landing.jsx, PublicSalon.jsx, Unauthorized.jsx, Placeholder.jsx
    ├── auth/{Login, Signup, AuthCallback}.jsx
    ├── onboarding/OnboardingSalon.jsx
    ├── client/{ClientHome, Discover, Vision}.jsx
    ├── salon/{SalonOverview, Services, Products}.jsx
    └── admin/AdminOverview.jsx
```

### Database (migrations)
- `0001_initial.sql` — tablas + RLS + triggers + helpers
- `0002_create_my_salon.sql` — RPC atómica para onboarding
- `0003_storage_and_catalog.sql` — buckets + columnas extras
- **`0004_fix_salons_rls.sql`** — fix de RLS sobre `salons.select` para authenticated (era el bug de hang/timeout en Discover y PublicSalon)

### User Personas
1. **Sofía — Clienta premium** (rol `client`)
2. **Valentina — Propietaria de salón** (rol `salon_owner`)
3. **Roomie Admin** (rol `admin`)

### Core Requirements (status)
- [x] Multi-tenant con `salon_id` en todas las tablas
- [x] Auth email/password + Google OAuth
- [x] Rutas protegidas por rol
- [x] Navegación responsive (sidebar + bottom-nav + drawer)
- [x] UI Luxury Minimal con glassmorphism + Manrope + gradientes pastel
- [x] i18n ES/EN
- [x] PWA-ready
- [x] Schema multi-tenant con RLS
- [x] Onboarding de salón (RPC atómica)
- [x] CRUD real de Services + Products (con Storage)
- [x] AI Hooks UI (Logo Studio, Vision) — mock por diseño
- [x] **Discover real** conectado a `public.salons` (Fase Final 1A)
- [x] **Página pública `/discover/:slug`** con servicios/productos/WhatsApp (Fase Final 1A)
- [x] **Fix bug logo upload** end-to-end (deferred upload → post-create) (Fase Final 1A)
- [x] **AI scaffolding** (`lib/ai.js`) listo para extracción de productos por imagen/URL y sugerencias futuras

### Timeline
- **2026-01-15** — MVP architecture v1 (Fases 1–3)
- **2026-01-15** — Fase 4: Core Business Layer (Services/Products CRUD + Storage + AI hooks UI)
- **2026-02-15** — Fase Final 1A: Discover real + página pública `/discover/:slug` + logo fix end-to-end + AI scaffolding

### Fase Final 1A — detalle de cambios (2026-02-15)
**Bugs críticos resueltos**
- Logo upload onboarding: las políticas RLS de `storage` exigen path `{salon_id}/...`. Antes se subía a `{user_id}/...` ANTES de crear el salón → RLS bloqueaba.
  - Fix: modo `deferred` en `ImageUploader` y `AILogoModal`. El File se queda en memoria. Después del RPC `create_my_salon` se sube con `scopeId={newSalon.id}` y se persiste vía `update salons set logo_url=...`.
- Discover/PublicSalon hang para usuarios authenticated: la RLS `salons_select_authenticated` con `is_active or is_admin()` provocaba evaluación per-row bajo JWT autenticado.
  - Fix server: migración `0004_fix_salons_rls.sql` con policy plana `using (is_active = true)` para anon + authenticated.
  - Fix cliente: `Promise.race` con timeout de 8s, `try/finally` con `setLoading(false)` garantizado, estado de timeout disambiguado de notfound.

**Componentes nuevos**
- `pages/client/Discover.jsx` — listado real de salones activos con tarjetas premium (gradiente del salón, logo/monograma fallback, categorías inferidas de servicios)
- `pages/PublicSalon.jsx` — página pública sin login con hero, personality chips, servicios, productos y WhatsApp CTA
- `lib/ai.js` — scaffolding ligero para futuras integraciones (extractFromImage, extractFromUrl, suggestServices, composeReply)

### Prioritized Backlog

**P0 — Acción manual del usuario**
- [ ] Ejecutar `0004_fix_salons_rls.sql` en Supabase SQL Editor (sin esto, los usuarios authenticated verán "Reintentar" en Discover y "No pudimos cargar el salón" en `/discover/:slug`)

**P1 — IA real (próxima fase)**
- [ ] AI Logo Generator real (reemplazar canvas con multimodal model)
- [ ] AI Vision real para `/app/vision` (selfie → look propuesto)
- [ ] AI Product Extraction (imagen → autofill)
- [ ] AI Product Extraction (URL → autofill)
- [ ] Suggestions: "Tus clientas aman balayage", "agrega gloss", etc.

**P2 — Funcionalidades diferidas**
- [ ] Onboarding emocional 3 pasos (hair/skin/lifestyle)
- [ ] Pagos (Stripe / MercadoPago)
- [ ] Promo codes
- [ ] Métricas reales en admin panel
- [ ] Calendar view de citas
- [ ] Push notifications

### Next Tasks
1. Usuario ejecuta `0004_fix_salons_rls.sql` en Supabase.
2. Validar que Discover authed muestra `discover-grid` con cards.
3. Validar que `/discover/:slug` authed muestra el salón completo.
4. Comenzar Fase 5 — IA real (Logo Studio + Vision multimodality).
