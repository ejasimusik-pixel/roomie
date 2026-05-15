# ROOMIE — Personal Care & Wellbeing
## Product Requirements Document (PRD)

> Plataforma SaaS PWA premium de belleza impulsada por IA para salones high-ticket.

---

### Original Problem Statement (verbatim)
Crear la arquitectura base de una plataforma SaaS PWA llamada ROOMIE.

- Stack: Supabase (Auth + PostgreSQL), arquitectura PWA, mobile-first responsive.
- Diseño: Luxury Minimal, Glassmorphism, Manrope, gradientes pastel (rosa #f9a8d4, azul #4285F4), sombras suaves, interfaz femenina premium. Inspiraciones: Apple, Headspace, Glossier, skincare luxury apps.
- Roles: `client`, `salon_owner`, `admin`.
- Páginas: Landing, Auth, Dashboard cliente, Workspace salón, Panel admin.
- Login: Google OAuth + email/password.
- Multi-tenant: todas las entidades llevarán `salon_id`.
- Rutas protegidas por rol.
- Navegación responsive.
- **NO implementar todavía**: IA, pagos, promo codes, RLS.

---

### Architecture
- **Frontend**: React 18 (CRA), `react-router-dom` v6, `@supabase/supabase-js` v2, `react-i18next`, `react-hook-form`, `lucide-react`, Tailwind 3. PWA-ready (manifest + theme color + apple-touch).
- **Backend**: Supabase-first (serverless). `/app/backend/server.py` es sólo un stub FastAPI con `/api/` y `/api/health`; **no** contiene lógica de negocio.
- **Auth**: Supabase client desde el browser. Cuando `REACT_APP_SUPABASE_URL` y `REACT_APP_SUPABASE_ANON_KEY` están vacíos, el cliente cae automáticamente en un **mock localStorage** con 3 usuarios sembrados (modo demo). Al añadir las keys, la app pasa al backend real sin cambios de código.
- **Roles** se almacenan en `user_metadata.role` (`client` | `salon_owner` | `admin`). El `salon_id` también va en `user_metadata`.
- **Rutas protegidas**: `<ProtectedRoute allowedRoles={[...]}>` redirige a `/login` o `/unauthorized` según corresponda.
- **i18n**: Español por defecto, inglés disponible, toggle persistido en localStorage (`roomie.lang`).

### Tech Stack
| Capa | Tecnología |
|---|---|
| UI | React 18, Tailwind 3, Manrope, lucide-react |
| Routing | react-router-dom v6 |
| Forms | react-hook-form |
| Auth/DB | Supabase (con fallback demo en localStorage) |
| i18n | i18next + react-i18next |
| PWA | manifest.json + meta theme-color + apple-touch-icon |
| Backend stub | FastAPI (health only) |

### File Layout (frontend)
```
src/
├── App.js                       # router + route guards
├── index.js, index.css          # entry + global styles (tokens + glass)
├── lib/
│   ├── supabase.js              # real client OR localStorage demo
│   └── i18n.js                  # ES/EN config
├── locales/{es,en}.json
├── context/AuthContext.jsx      # session + role + auth methods
├── components/
│   ├── Logo.jsx, AppShell.jsx
│   ├── Sidebar.jsx, TopBar.jsx, BottomNav.jsx
│   ├── ProtectedRoute.jsx
│   ├── GlassCard.jsx, StatCard.jsx
└── pages/
    ├── Landing.jsx, Unauthorized.jsx, Placeholder.jsx
    ├── auth/{Login,Signup,AuthCallback}.jsx
    ├── client/ClientHome.jsx
    ├── salon/SalonOverview.jsx
    └── admin/AdminOverview.jsx
```

### User Personas
1. **Sofía — Clienta premium** (rol `client`): busca un concierge de belleza calmado y elegante; descubre salones high-ticket, reserva sin fricción, guarda favoritos.
2. **Valentina — Propietaria de salón** (rol `salon_owner`): gestiona agenda, clientas, servicios y equipo; analiza ocupación e ingresos del mes.
3. **Roomie Admin** (rol `admin`): supervisa salones, usuarias y salud de la plataforma.

### Core Requirements (static)
- [x] Multi-tenant (`salon_id` listo en `user_metadata`, pendiente de tabla `profiles` cuando se active Supabase real).
- [x] Auth con email/password y botón Google OAuth listo.
- [x] Rutas protegidas por rol.
- [x] Navegación responsive (sidebar desktop + bottom-nav mobile + drawer menu).
- [x] Estructura escalable (carpetas por rol, componentes reutilizables, layout único AppShell).
- [x] UI Luxury Minimal con glassmorphism, Manrope, gradiente azul→violeta→magenta.
- [x] i18n ES/EN con switch persistente.
- [x] PWA-ready (manifest + theme + icons).

### What's been implemented — 2026-01-15
- Arquitectura completa frontend React + Supabase client (con modo demo localStorage).
- Stub FastAPI con health endpoints.
- Landing pública con hero, features y CTAs.
- Auth: `/login`, `/signup`, `/auth/callback`, `/unauthorized`.
- Layout único AppShell con Sidebar (md+), TopBar (mobile) y BottomNav (mobile).
- Dashboard Cliente con saludo, próxima reserva, salones destacados, secciones placeholder de rituales/favoritos.
- Workspace Salón con 4 KPIs, próximas citas y atajos.
- Panel Admin con 4 KPIs y placeholders por sección.
- 11 sub-rutas con placeholders elegantes.
- i18n ES/EN completo.
- 3 usuarios demo sembrados automáticamente.
- Testing agent: backend 3/3 ✅, frontend 33/33 ✅.

### Prioritized Backlog (siguiente sprint)
**P0 — Conectar Supabase real**
- Recibir `SUPABASE_URL` y `SUPABASE_ANON_KEY` del usuario y poblarlas en `/app/frontend/.env`.
- Crear migración SQL inicial: tabla `salons` y tabla `profiles` (con `salon_id`).
- Configurar Google OAuth en el dashboard de Supabase + redirect URL.
- Activar trigger `auth.users` → `public.profiles`.

**P1 — Datos reales y CRUD básicos**
- Endpoints/queries Supabase para: salones, servicios, equipo, agenda, reservas.
- Reemplazar mocks visuales del cliente y salón por datos en vivo.
- Subida de avatar e imágenes de salón a Supabase Storage.

**P2 — Funcionalidad diferida (declarada NO en MVP)**
- Recomendaciones IA (concierge).
- Pagos (Stripe / MercadoPago).
- Promo codes.
- RLS policies por tenant.
- Métricas reales en panel admin.

### Next Tasks
1. Recoger keys de Supabase del usuario y conectarlas.
2. Crear schema SQL inicial (salons + profiles + handle_new_user trigger).
3. Configurar Google OAuth provider en Supabase y validar callback en producción.
4. Reemplazar datos seed visuales del dashboard cliente/salón por queries Supabase.
