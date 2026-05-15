# ROOMIE — Personal Care & Wellbeing
## Product Requirements Document (PRD)

> Plataforma SaaS PWA premium de belleza impulsada por IA para salones high-ticket.

---

### Original Problem Statement (verbatim)
Crear la arquitectura base de una plataforma SaaS PWA llamada ROOMIE.

- Stack: Supabase (Auth + PostgreSQL), arquitectura PWA, mobile-first responsive.
- Diseño: Luxury Minimal, Glassmorphism, Manrope, gradientes pastel (rosa #f9a8d4, azul #4285F4), sombras suaves, interfaz femenina premium.
- Roles: `client`, `salon_owner`, `admin`.
- Páginas: Landing, Auth, Dashboard cliente, Workspace salón, Panel admin.
- Login: Google OAuth + email/password.
- Multi-tenant: todas las entidades llevarán `salon_id`.
- Rutas protegidas por rol.
- Navegación responsive.
- **NO implementar todavía**: IA, pagos, promo codes.

---

### Architecture
- **Frontend**: React 18 (CRA), `react-router-dom` v6, `@supabase/supabase-js` v2, `react-i18next`, `react-hook-form`, `lucide-react`, Tailwind 3. PWA-ready.
- **Backend**: 100% Supabase (PostgreSQL + Auth + RLS). El archivo `/app/backend/server.py` es sólo un health-stub.
- **Auth**: Supabase client desde el browser. Las credenciales reales están en `/app/frontend/.env`. Hay un fallback automático a un mock localStorage cuando las keys están vacías (modo demo).
- **Multi-tenant**: tabla `salons` como raíz. Todas las tablas derivadas llevan `salon_id`. `profiles.salon_id` es nullable (admin global + clientas sin salón).
- **RLS activo desde el primer día** con dos helpers `security definer` (`public.current_role()`, `public.current_salon_id()`) para evitar recursión.
- **i18n**: Español por defecto, inglés disponible, toggle persistente.

### Tech Stack
| Capa | Tecnología |
|---|---|
| UI | React 18, Tailwind 3, Manrope, lucide-react |
| Routing | react-router-dom v6 |
| Forms | react-hook-form |
| Auth/DB | Supabase (real conectado: `dxfqnwdwqmuyyzpdlgcl.supabase.co`) |
| i18n | i18next + react-i18next |
| PWA | manifest.json + meta theme-color + apple-touch-icon |
| Backend stub | FastAPI (health only) |

### Database schema (v1)
Migración: `/app/supabase/migrations/0001_initial.sql`

Tablas: `salons`, `profiles`, `services`, `products`, `appointments`, `client_profiles`, `hair_profiles`, `onboarding_answers`.

Características clave:
- Todas las tablas tienen `created_at`/`updated_at` (mantenidos por trigger compartido).
- Todas las tablas excepto `salons` llevan `salon_id`.
- `profiles.salon_id` es nullable por diseño.
- `roomie_personality jsonb` en `salons` (reservado para IA contextual futura).
- Trigger `on_auth_user_created` en `auth.users` provisiona `profiles` automáticamente leyendo `role`/`salon_id`/`full_name` desde `raw_user_meta_data`.
- RLS policies cubren `client`, `salon_owner` y `admin` con scoping multi-tenant.
- Índices: `salon_id` en cada tabla, `slug` en salons, `(salon_id, starts_at)` en appointments, etc.

### File Layout (frontend)
```
src/
├── App.js, index.js, index.css
├── lib/{supabase.js, i18n.js}
├── locales/{es,en}.json
├── context/AuthContext.jsx     # lee profile desde public.profiles vía Supabase
├── components/{Logo, AppShell, Sidebar, TopBar, BottomNav, ProtectedRoute, GlassCard, StatCard}.jsx
└── pages/
    ├── Landing.jsx, Unauthorized.jsx, Placeholder.jsx
    ├── auth/{Login, Signup, AuthCallback}.jsx
    ├── client/ClientHome.jsx
    ├── salon/SalonOverview.jsx
    └── admin/AdminOverview.jsx
```

### User Personas
1. **Sofía — Clienta premium** (rol `client`).
2. **Valentina — Propietaria de salón** (rol `salon_owner`).
3. **Roomie Admin** (rol `admin`).

### Core Requirements (status)
- [x] Multi-tenant con `salon_id` en todas las tablas.
- [x] Auth con email/password y botón Google OAuth listo.
- [x] Rutas protegidas por rol.
- [x] Navegación responsive (sidebar desktop + bottom-nav mobile + drawer menu).
- [x] Estructura escalable.
- [x] UI Luxury Minimal con glassmorphism, Manrope, gradiente azul→violeta→magenta.
- [x] i18n ES/EN con switch persistente.
- [x] PWA-ready.
- [x] Schema SQL multi-tenant con RLS activo.
- [x] AuthContext leyendo `public.profiles` con fallback graceful.

### Timeline
**2026-01-15 — MVP architecture v1**
- Frontend completo, todos los flujos auth funcionando contra mock.
- Backend stub.
- Testing 100% (33/33 frontend, 3/3 backend).

**2026-01-15 — Supabase real conectado**
- Keys reales en `/app/frontend/.env` (`dxfqnwdwqmuyyzpdlgcl`).
- `AuthContext` ahora consulta `public.profiles` (con fallback a metadata si la migración aún no se ha ejecutado).
- Login contra Supabase real verificado (errores reales del servicio).
- Migración SQL completa generada en `/app/supabase/migrations/0001_initial.sql` (pendiente: usuario debe ejecutarla en el SQL Editor).

**2026-01-15 — Onboarding del salón**
- Nueva migración `0002_create_my_salon.sql` con función RPC `public.create_my_salon(...)` (security definer) que valida que el caller es `salon_owner` sin `salon_id`, crea la fila en `salons` y actualiza `profiles.salon_id` atómicamente.
- Nueva página `/onboarding/salon` (Manrope · glassmorphism · 3 secciones: Identidad, Paleta visual, Voz de Roomie) con live preview, presets de color y campos `roomie_personality` (tone/style/emoji_level/sales_style).
- Componente `SalonOnboardingGate` que envuelve `/salon/*` y redirige a `/onboarding/salon` cuando `role='salon_owner' AND salon_id IS NULL`.
- Tras crear el salón, `refreshProfile()` actualiza el contexto y redirige a `/salon`.

### Prioritized Backlog

**P0 — Activar el backend real (acción manual del usuario)**
- [ ] Ejecutar `0001_initial.sql` en el SQL Editor de Supabase.
- [ ] Configurar redirect URL (`/auth/callback`) en Authentication → URL Configuration.
- [ ] Promover primera cuenta admin (`update profiles set role='admin' where email=…`).
- [ ] Configurar Google como Auth Provider en Supabase (Client ID/Secret).

**P1 — Datos reales en UI**
- [ ] Reemplazar mocks visuales del cliente y salón por queries a Supabase.
- [ ] CRUD de servicios/productos en el workspace del salón.
- [ ] CRUD de appointments con calendar view.
- [ ] Subida de avatar + logos a Supabase Storage.

**P2 — Funcionalidades diferidas (declaradas NO en MVP)**
- [ ] Onboarding emocional de 3 pasos (cabello + piel + estilo de vida).
- [ ] IA concierge sobre `roomie_personality` + `hair_profiles`.
- [ ] Pagos (Stripe / MercadoPago).
- [ ] Promo codes.
- [ ] Métricas reales en panel admin.

### Next Tasks
1. Usuario ejecuta `0001_initial.sql` en Supabase.
2. Usuario hace primer signup; verificamos que el trigger crea su `profiles` row.
3. Promovemos esa cuenta a `admin`.
4. Empezamos a conectar UI a datos reales empezando por dashboard salón (services + appointments).
