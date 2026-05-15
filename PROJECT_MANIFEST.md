# ROOMIE — PROJECT MANIFEST
> Estado técnico completo · v1 · Fase Final 1A

---

## 1 · VISIÓN DEL PRODUCTO

### Qué es Roomie
Roomie es una plataforma **SaaS PWA premium** que opera como **Beauty Business Operating System** para salones high-ticket. No es un "Booksy más bonito": es la capa operativa + concierge IA que un salón de lujo necesita para gestionar su catálogo, sus clientas y su identidad de marca dentro de una experiencia que se siente Apple-meets-luxury-spa.

### Público objetivo
1. **Salones premium independientes** (1–10 estilistas) que cobran por encima del promedio y compiten en experiencia, no en precio.
2. **Estilistas/empresarias en transición** que están saliendo de salones corporativos y necesitan branding + operación sin contratar un equipo técnico.
3. **Clientas premium** que prefieren reservar y descubrir desde un espacio curado en lugar de Instagram + WhatsApp suelto.

### Diferenciador principal
- **Multi-tenant real con personalidad por salón** (`roomie_personality` JSONB) — cada salón hereda colores, tono, estilo de venta y nivel de calidez de su concierge digital.
- **AI concierge first-class** — la arquitectura está pensada desde día 0 para incrustar IA (vision, multimodal, recomendaciones, autofill) sin reescribir el frontend.
- **Estética luxury minimal coherente** — glassmorphism + Manrope + gradientes pastel + animaciones contenidas. La app se siente premium incluso vacía.
- **Cobertura amplia, no solo peluquería**: hair, nails, brows, lashes, facial, spa, makeup, wellness, skincare.

### Filosofía "Luxury Minimal + AI Concierge"
> _Premium se siente en el silencio, no en el ruido._

- **Espacio en blanco generoso** como elemento de diseño activo.
- **Una sola acción primaria por pantalla**, todo lo demás es contexto.
- **IA invisible**: Roomie sugiere, autocompleta y propone sin gritar "IA"; el usuario siente magia, no chatbots.
- **Ningún detalle estridente**: emojis controlados por `roomie_personality.emoji_level`, gradientes pastel, sombras suaves, transiciones de 300 ms.

---

## 2 · STACK TÉCNICO

### Frontend
| Capa | Tecnología | Versión |
|---|---|---|
| Framework | React 18 (Create React App) | 18.x |
| Routing | `react-router-dom` | v6 |
| Forms | `react-hook-form` | latest |
| i18n | `i18next` + `react-i18next` | latest |
| Iconos | `lucide-react` | latest |
| Estilos | Tailwind CSS 3 + `index.css` con tokens custom | 3.x |
| Fuentes | **Manrope** (display + body), pesos 400/500/600/700/800 | Google Fonts |
| PWA | `manifest.json` + meta theme-color + apple-touch-icon | manual |

### Backend
- **Backend "real" = Supabase** (PostgreSQL + Auth + Storage + Realtime + RPC).
- `/app/backend/server.py` es un **health-stub en FastAPI** (no aloja lógica del producto). Existe para compatibilidad con la plataforma de hosting.

### Supabase
| Servicio | Uso |
|---|---|
| Auth | Email/password + Google OAuth (vía `/auth/callback`) |
| PostgreSQL | 8 tablas multi-tenant + RLS estricta |
| Storage | 4 buckets (3 públicos + 1 privado) |
| RPC | `create_my_salon` (atómica para onboarding) |
| Triggers | `on_auth_user_created` (auto-provisiona `profiles`) |

### Storage (buckets)
- `salon-logos` · público · 5 MB · path `{salon_id}/...`
- `service-images` · público · 5 MB · path `{salon_id}/...`
- `product-images` · público · 5 MB · path `{salon_id}/...`
- `client-uploads` · **privado** · 10 MB · path `{user_id}/...` (selfies Vision con signed URL)

### Routing
- React Router v6 declarativo (`Routes` + `Route` + `Outlet`).
- Rutas protegidas por rol vía `<ProtectedRoute allowedRoles={[...]}>`.
- `SalonOnboardingGate` redirige `salon_owner` sin `salon_id` a `/onboarding/salon`.

### Estado global
- **`AuthContext`** — única fuente de verdad: `session`, `profile`, `loading`, `role`, `salonId` + funciones (`signIn`, `signOut`, `refreshProfile`, `applyLocalProfile`).
- **React local state** para datos por pantalla (con `useEffect` + Supabase SDK). Sin Redux, sin Zustand: scope intencionalmente pequeño y predecible.

### Librerías importantes
- `@supabase/supabase-js` v2 (cliente único en `lib/supabase.js`)
- `react-hook-form` para validación de formularios premium
- `lucide-react` para iconografía consistente
- `sonner` está disponible para toasts (`components/ui/sonner.tsx`)

---

## 3 · ESTRUCTURA FRONTEND

### Árbol clave
```
/app/frontend/src/
├── App.js                    # Routing raíz
├── index.js / index.css      # Tokens (rm-glass, rm-bg-aurora, rm-btn-*, rm-chip, rm-text-gradient)
├── lib/
│   ├── supabase.js           # cliente único + isSupabaseConfigured
│   ├── storage.js            # uploadImage, BUCKETS, validateImageFile, pathFromPublicUrl
│   ├── catalog.js            # SERVICE_CATEGORIES, PRODUCT_TYPES, formatPrice, categoryMeta
│   ├── ai.js                 # 🆕 scaffolding IA (stubs vendor-agnostic)
│   ├── errors.js             # mapSupabaseError
│   └── i18n.js               # config i18next
├── locales/
│   ├── es.json               # idioma por defecto
│   └── en.json
├── context/
│   └── AuthContext.jsx       # provider único de auth + profile
├── components/
│   ├── AppShell.jsx          # layout autenticado (Sidebar + TopBar + BottomNav + Outlet)
│   ├── Sidebar.jsx           # desktop md+
│   ├── BottomNav.jsx         # mobile
│   ├── TopBar.jsx            # mobile drawer trigger
│   ├── Logo.jsx              # wordmark Roomie
│   ├── ProtectedRoute.jsx    # rol-aware redirect
│   ├── SalonOnboardingGate.jsx
│   ├── GlassCard.jsx, StatCard.jsx, EmptyState.jsx, Skeleton.jsx
│   ├── Modal.jsx
│   ├── ImageUploader.jsx     # drag&drop + deferred mode
│   └── AILogoModal.jsx       # Logo Studio (mock canvas + deferred)
└── pages/
    ├── Landing.jsx
    ├── PublicSalon.jsx       # 🆕 /discover/:slug (anon-readable)
    ├── Unauthorized.jsx, Placeholder.jsx
    ├── auth/
    │   ├── Login.jsx, Signup.jsx, AuthCallback.jsx
    ├── onboarding/
    │   └── OnboardingSalon.jsx
    ├── client/
    │   ├── ClientHome.jsx
    │   ├── Discover.jsx      # 🆕 lista real de salones
    │   └── Vision.jsx        # Roomie Vision (mock UI)
    ├── salon/
    │   ├── SalonOverview.jsx, Services.jsx, Products.jsx
    └── admin/
        └── AdminOverview.jsx
```

### Rutas completas
| Path | Quién | Componente |
|---|---|---|
| `/` | público | Landing |
| `/login`, `/signup` | público | Auth |
| `/auth/callback` | público | OAuth callback |
| `/unauthorized` | público | Pantalla 403 |
| `/discover/:slug` | público (anon + auth) | **PublicSalon** |
| `/onboarding/salon` | `salon_owner` | OnboardingSalon |
| `/app` | client/salon_owner/admin | ClientHome |
| `/app/discover` | idem | **Discover** real |
| `/app/vision` | idem | Roomie Vision |
| `/app/bookings`, `/app/profile` | idem | Placeholder |
| `/salon` (gated by salon_id) | salon_owner/admin | SalonOverview |
| `/salon/services`, `/salon/products` | idem | CRUD real |
| `/salon/agenda`, `/clients`, `/team` | idem | Placeholder |
| `/admin`, `/admin/salons`, `/admin/users`, `/admin/health` | admin | Admin |
| `*` | cualquiera | redirect → `/` |

### Layouts
- **AppShell** — único layout autenticado. Variantes por `role` (`client` / `salon_owner` / `admin`) cambian el contenido de la nav pero no la estructura visual.
- **Páginas públicas** — sin AppShell; Landing y PublicSalon montan su propio header.

### Providers
- `<AuthProvider>` en `index.js` envolviendo `<App />`.
- `<I18nextProvider>` (vía `lib/i18n.js`).

### Contexts
- `AuthContext` — único. Expone: `session`, `user`, `profile`, `loading`, `isAuthenticated`, `role`, `salonId`, `isDemoBackend`, `signUp`, `signIn`, `signInWithGoogle`, `signOut`, `refreshProfile`, `applyLocalProfile`.

### Hooks reutilizables
- `useAuth()` — proxy al contexto.
- `useTranslation()` (i18next).
- `useNavigate`, `useParams`, `useLocation` (router).
- `useForm` (RHF) — usado en Auth + Onboarding + Modales de Services/Products.

### Componentes shared
- `GlassCard`, `StatCard`, `EmptyState`, `Skeleton` — primitivos del lenguaje visual.
- `ImageUploader` — drag&drop con modo `deferred` (no sube hasta que el padre lo ordena).
- `AILogoModal` — modal de logo studio (deferred opcional).
- `Modal` — base para los modales premium.
- `ProtectedRoute`, `SalonOnboardingGate` — guards.

---

## 4 · AUTENTICACIÓN

### Signup / Login
- Email + password vía Supabase Auth.
- Google OAuth (botón listo; el provider se configura en el dashboard Supabase).
- `emailRedirectTo` → `${origin}/auth/callback`.

### Roles
| Rol | salón? | Acceso |
|---|---|---|
| `client` | nullable | `/app/*` |
| `salon_owner` | obligatorio (gate redirige a `/onboarding/salon` si falta) | `/salon/*` + `/app/*` |
| `admin` | nullable | todo |

### Flujo onboarding (`salon_owner`)
1. Signup como `salon_owner` (sin `salon_id`).
2. Trigger `handle_new_user` provisiona row en `profiles` (con `role` de metadata).
3. Login → `SalonOnboardingGate` detecta `!salon_id` y redirige a `/onboarding/salon`.
4. Formulario premium: identidad (nombre, slug, WhatsApp, logo), paleta visual (6 presets + custom), personalidad Roomie (4 selects).
5. **Logo en modo deferred** — el File queda en estado local.
6. Submit → RPC `create_my_salon` (atómica):
   - crea `salons` con `created_by = auth.uid()`
   - actualiza `profiles.salon_id` del owner
7. Post-creación: sube el logo a `salon-logos/{new_salon_id}/...` y `UPDATE salons SET logo_url=...`.
8. `applyLocalProfile({ salon_id, role })` → sync UI sin esperar fetch.
9. `refreshProfile()` (best-effort) + `navigate('/salon')`.

---

## 5 · BASE DE DATOS

### Migrations ejecutadas
| Archivo | Contenido |
|---|---|
| `0001_initial.sql` | 8 tablas, RLS, helpers, trigger auth.users→profiles, índices |
| `0002_create_my_salon.sql` | RPC `create_my_salon` atómica |
| `0003_storage_and_catalog.sql` | Productos (`category`, `recommended_for`) + buckets + RLS storage |
| `0004_fix_salons_rls.sql` | **Fix de stall** en SELECT `salons` para authenticated (eliminar `is_admin()` del hot path) |

### Tablas

#### `salons` (raíz del tenant)
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | gen_random_uuid |
| name | text NN | |
| slug | text NN UNIQUE | URL pública |
| logo_url | text | público (CDN Supabase) |
| primary_color | text NN | `#E040A0` default |
| secondary_color | text NN | `#7C52AA` default |
| roomie_personality | jsonb NN | `{tone, style, emoji_level, sales_style}` |
| whatsapp_number | text | E.164 |
| is_active | boolean NN | true |
| created_at, updated_at | timestamptz NN | trigger |

#### `profiles` (1:1 con `auth.users`)
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK FK auth.users | cascade |
| role | text NN check in (client,salon_owner,admin) | |
| salon_id | uuid FK salons | nullable |
| full_name, email, avatar_url, locale | text | |

#### `services`
| salon_id | name | description | category | duration_minutes | price_cents | currency | image_url | is_active |

#### `products`
| salon_id | name | description | brand | sku | price_cents | currency | stock | image_url | category | recommended_for text[] | is_active |

#### `appointments`
| salon_id | client_id FK profiles | staff_id FK profiles | service_id FK services | starts_at | ends_at | status check in (pending,confirmed,completed,cancelled,no_show) | notes |

#### `client_profiles` (1:1 con profile tipo client)
| profile_id UNIQUE | salon_id | birthdate | phone | lifestyle | preferred_vibe | skin_tone | allergies text[] | notes |

#### `hair_profiles` (1:1 con client_profile)
| client_profile_id UNIQUE | salon_id | hair_type | hair_thickness | scalp_type | current_treatments text[] | color_history jsonb | last_service_date | notes |

#### `onboarding_answers` (N:1 con profile, versionable)
| profile_id | salon_id | onboarding_version | question_key | answer jsonb | UNIQUE(profile_id, version, key) |

### Relaciones
```
salons (tenant root)
  ├─ profiles.salon_id          (nullable; admin global allowed)
  ├─ services.salon_id          (cascade)
  ├─ products.salon_id          (cascade)
  ├─ appointments.salon_id      (cascade)
  ├─ client_profiles.salon_id   (set null)
  ├─ hair_profiles.salon_id     (set null)
  └─ onboarding_answers.salon_id (set null)

auth.users ──trigger──> profiles
profiles ─ 1:1 ─ client_profiles ─ 1:1 ─ hair_profiles
```

### RLS · Policies (resumen)
- **salons**:
  - `salons_select_active` → anon + authenticated, `using (is_active=true)` (post-0004)
  - `salons_select_admin_all` → authenticated admin (incluye inactivos)
  - update → admin OR (salon_owner AND id=current_salon_id())
  - insert → admin
  - delete → admin
- **profiles**: select propio / tenant / admin; update propio / admin
- **services**, **products**: select público si is_active OR tenant scope; write owner/admin
- **appointments**: select propio (client/staff) o tenant; insert según rol
- **client_profiles**, **hair_profiles**, **onboarding_answers**: select propio / tenant; write self/admin

### Triggers
- `on_auth_user_created` (`auth.users` → provisiona `profiles` con role/salon_id/full_name desde `raw_user_meta_data`)
- `*_set_updated_at` en cada tabla (mantiene `updated_at`)

### Funciones helper
- `public.current_role()` — security definer
- `public.current_salon_id()` — security definer
- `public.is_admin()` — security definer
- `public.create_my_salon(...)` — RPC atómica para onboarding

### RPCs
| Nombre | Uso | Returns |
|---|---|---|
| `create_my_salon` | Crea salón + ata `profiles.salon_id` del owner en una transacción | `{ id, name, slug, ... }` |

---

## 6 · STORAGE

### Buckets
| Bucket | Público | Max | Path convention | Uso |
|---|---|---|---|---|
| `salon-logos` | ✅ | 5 MB | `{salon_id}/<rand>.{ext}` | Logo del salón |
| `service-images` | ✅ | 5 MB | `{salon_id}/<rand>.{ext}` | Hero de servicios |
| `product-images` | ✅ | 5 MB | `{salon_id}/<rand>.{ext}` | Imagen de productos |
| `client-uploads` | ❌ | 10 MB | `{user_id}/<rand>.{ext}` | Selfies Roomie Vision (signed URL 1h) |

### Storage policies
Patrón uniforme: **path[1] = current_salon_id()** para los tres buckets de salón, **path[1] = auth.uid()** para `client-uploads`.

- `*_public_read` → anyone select
- `*_owner_write` → salon_owner del tenant correcto (o admin)
- `*_owner_update` / `*_owner_delete` → mismo

### Flujo upload (canónico)
1. **Validación cliente** (`validateImageFile`): tipo MIME ∈ {png, jpeg, webp}, tamaño ≤ 5 MB.
2. **Path generado**: `${scopeId}/${timestamp}-${random}.${ext}`.
3. **`supabase.storage.from(bucket).upload(path, file)`** con `cacheControl=3600`, `upsert=false`, `contentType`.
4. Bucket público → `getPublicUrl(path)`. Bucket privado → `createSignedUrl(path, 3600)`.
5. URL persistida en la fila correspondiente (`salons.logo_url`, `services.image_url`, etc.).
6. **Cache-busting** en render: `?t=${updated_at}`.

### Caso especial: logo onboarding (deferred)
Al onboarding el salón **aún no existe**, así que el path `{salon_id}/...` no se puede satisfacer hasta después del RPC. Solución:
1. `ImageUploader deferred` deja el File en memoria.
2. RPC crea el salón.
3. `uploadImage({ scopeId: newSalon.id })` con el `salon_id` real.
4. `UPDATE salons SET logo_url=...`.

---

## 7 · FUNCIONALIDADES IMPLEMENTADAS

### ✅ Onboarding salón
- Form único, 3 secciones (identidad / paleta / personalidad).
- 6 presets de paleta + custom color picker (hex con regex).
- 4 selectores de personalidad (tone, style, emoji_level, sales_style) → `roomie_personality jsonb`.
- Logo manual (drag&drop) o AI (canvas-mock con monograma + paleta).
- Live preview del salón con gradient + slug.

### ✅ Discover (real)
- Query a `public.salons` con `is_active=true`.
- Categorías inferidas por salón a partir de `services` activos.
- Cards luxury minimal: hero con gradient + logo/monograma fallback, chip Premium, lista de hasta 3 categorías, CTA "Ver salón".
- Timeout 8s + try/finally + estados `discover-grid` / `discover-empty` / `discover-error`.

### ✅ Public salon (`/discover/:slug`)
- Accesible sin login.
- Hero con gradient del salón + logo grande / monograma fallback.
- Chips de personality (tone, style, sales_style).
- CTA WhatsApp con mensaje pre-rellenado (`wa.me/...?text=...`).
- 6 servicios destacados (categoría, descripción, duración, precio).
- 6 productos destacados (marca, descripción, precio).
- Estados `notfound` y `error` disambiguados.

### ✅ Servicios (CRUD)
- Lista + modal de creación/edición.
- 9 categorías con iconos lucide-react.
- Image upload directo a `service-images/{salon_id}/`.
- Toggle activo/borrador, eliminación con confirm.

### ✅ Productos (CRUD)
- Marca + tipo + precio + `recommended_for` (tags).
- Image upload directo a `product-images/{salon_id}/`.
- Mismo patrón de modal/toggle/eliminación.

### ✅ Roomie Vision (Beta · UI mock)
- Upload de selfie a `client-uploads/{user_id}/` (signed URL 1h).
- Transición "preparing your look" cinematográfica.
- Propuesta visual mock (look + manicura + maquillaje + mood + paleta).

### ✅ AI Logo Studio (UI mock)
- 4 estilos × 6 paletas × monograma de canvas.
- Modo deferred (onboarding) o upload directo (post-onboarding).

### ✅ Dashboards
- **Salon overview**: KPIs (servicios activos / productos / próximas citas), header con logo + slug, próximas citas, quick actions, error chip.
- **Client home**: greeting personalizado, próxima cita (empty state), CTA Discover.
- **Admin overview**: KPIs base + placeholder para módulos pendientes.

### ✅ Empty states
- `EmptyState` reutilizable (icon + title + description + CTA opcional).
- Discover sin salones, services/products vacíos, próximas citas vacías.

### ✅ Responsive mobile
- **Mobile-first**: BottomNav fijo + TopBar con drawer.
- **md+**: Sidebar fijo 288px + main `pl-72`.
- Cards y formularios con grid `sm:grid-cols-2 lg:grid-cols-3`.
- Overflow protegido con `min-w-0` + `truncate`.
- Aspect ratios consistentes (`aspect-square`, `aspect-[16/10]`).

---

## 8 · AI ARCHITECTURE

### `lib/ai.js`
Módulo intencionalmente delgado. Define el **contrato** que Roomie usará cuando llegue la integración real.

```js
extractProductFromImage(file)   // vision model → JSON estructurado
extractProductFromUrl(url)       // scrape + LLM normalización
suggestServicesForSalon(salon, services)  // sugerencias contextuales
composeRoomieReply(salon, context)         // respuestas en el tono del salón
```

Hoy todas devuelven `{ data: null, mocked: true }` con `hint` descriptivo. Las call-sites (Services, Products, Roomie chat futuro) se conectarán sin cambios estructurales.

### Hooks preparados
- `OnboardingSalon` ya recoge `roomie_personality` (tone + style + emoji_level + sales_style) → directamente alimentable al system prompt.
- `Vision.jsx` ya sube selfies a bucket privado con signed URLs → directamente consumible por modelos multimodales.
- `AILogoModal` con modo deferred → permite intercambiar el canvas-mock por una llamada multimodal sin tocar el resto.

### Futuros flujos IA
1. **Productos por imagen**: form `+ Producto con IA` → vision model → autofill (nombre, marca, tipo, recomendado_for).
2. **Productos por URL**: pegar URL Sephora/Mercadolibre → scrape + LLM → autofill.
3. **Servicios asistidos**: panel "Roomie sugiere…" en `/salon` con propuestas (e.g. "agrega gloss", "tus clientas aman balayage").
4. **Beauty Concierge real**: Roomie responde mensajes con `roomie_personality` + `hair_profiles` + `onboarding_answers` del cliente.
5. **Logo Studio real**: canvas → modelo multimodal (e.g. nano banana) con presets de marca.
6. **Vision real**: selfie → propuesta visual (look, color, manicura, makeup) con modelo multimodal.

### OpenRouter / Emergent LLM Key readiness
- Cliente Supabase ya en browser; el LLM call vivirá detrás de **Supabase Edge Functions** (función serverless con secret seguro) o un endpoint mínimo en el backend stub.
- Frontend solo verá `await ai.extractProductFromImage(file)` — internamente esa función llamará a la Edge Function que firma la request al modelo.
- Universal Emergent LLM Key compatible con Claude / Gemini Nano Banana / OpenAI / Sora 2 / Whisper — listo para integrar vía `integration_playbook_expert_v2`.

### Multimodal readiness
- Bucket `client-uploads` privado + signed URLs → perfecto para pasar selfies a modelos vision.
- Bucket `salon-logos` público → URLs CDN directas para multimodal sin cargas adicionales.
- `roomie_personality` jsonb → contexto del salón inyectable en system prompts.

---

## 9 · UX/UI SYSTEM

### Branding
- Wordmark **Roomie** en gradiente azul→violeta→magenta.
- Avatar/emoji-mark coherente (`/icons/emoji-roomie.jpg`).

### Colores (tokens en `index.css`)
| Token | Hex | Uso |
|---|---|---|
| Magenta 500 | `#E040A0` | acción primaria, chips |
| Violet 500 | `#7C52AA` | secundario |
| Sky 400 | `#4285F4` | acento azul |
| Pink 300 | `#F9A8D4` | gradient pastel |
| Violet 900 | `#1F1146` | texto display |
| Violet 500 | text body |
| Violet 400 | text secundario |
| Violet 300 | placeholders / iconos suaves |

### Tipografía
- **Manrope** (Google Fonts) · pesos 400–800.
- `font-display` (extrabold tracking-tight) para headings; body normal.
- Jerarquía: H1 `text-3xl md:text-4xl`, H2 `text-xl`, body `text-base`/`text-sm`.

### Filosofía visual
- **Glassmorphism**: `rm-glass` (bg-white/40 + backdrop-blur) y `rm-glass-strong`.
- **Aurora background**: `rm-bg-aurora` con blobs pastel difuminados.
- **Botones**: `rm-btn-primary` (gradient magenta→violet + shadow-pill), `rm-btn-ghost`, `rm-chip`.
- **Sombras**: `shadow-soft`, `shadow-pill`, `shadow-glow` (jerarquía clara).
- **Bordes**: rounded `2rem`/`3rem` para cards grandes; rounded `2xl` para inputs y botones.
- **Animaciones**: `animate-fade-in`, `animate-scale-in`, `animate-float` · 250–400 ms · curva ease-out.

### Responsive strategy
- **Mobile-first** absoluta (`base classes` para mobile, `md:` para desktop).
- `min-w-0` + `truncate` en todos los flex children con texto.
- BottomNav fijo (h-20) + `pb-28 md:pb-0` en el main wrapper.
- Sidebar fijo md+ (`md:pl-72`).
- Grid responsive: `sm:grid-cols-2 lg:grid-cols-3`.

---

## 10 · DEPLOYMENT

### Correr localmente
```bash
# Backend stub (FastAPI) — solo health, ya gestionado por supervisor
sudo supervisorctl status backend frontend

# Frontend (hot reload activo)
cd /app/frontend
yarn install
yarn start  # ya corre vía supervisor en :3000
```

### Variables de entorno

#### `/app/frontend/.env`
```
REACT_APP_BACKEND_URL=https://<preview-or-prod-domain>
REACT_APP_SUPABASE_URL=https://dxfqnwdwqmuyyzpdlgcl.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_P7JnJVV1mR1QS_F8I4gifA_X7Isz68K
```

#### `/app/backend/.env`
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
```
> MongoDB no se usa (legacy del stub). No tocar.

### Variables Supabase (dashboard)
1. **Authentication → URL Configuration**: añadir `${preview-domain}/auth/callback`.
2. **Authentication → Providers → Google**: configurar Client ID/Secret.
3. **SQL Editor**: ejecutar en orden `0001`, `0002`, `0003`, **`0004`**.
4. **Storage → Policies**: ya provisionadas por `0003`.

### Build / deploy flow
- Plataforma Emergent — preview siempre live vía `REACT_APP_BACKEND_URL`.
- Producción → "Save to GitHub" → deploy con Vercel/Netlify (envs los mismos).
- Supabase es ambiente único (no hay staging separado todavía).

---

## 11 · KNOWN BUGS

### 🔴 Activos
| ID | Severidad | Descripción | Estado |
|---|---|---|---|
| BUG-001 | HIGH (mitigado en cliente) | `salons` SELECT cuelga para authenticated antes de migración 0004 | **Requiere correr `0004_fix_salons_rls.sql`** |

### 🟡 Riesgos / cold-start
| Riesgo | Mitigación actual |
|---|---|
| Supabase SDK cold-start lag post-signup (10–15 s en primera escritura) | Failsafe 3.5 s en AuthContext + timeouts 5–10 s en queries críticas + `applyLocalProfile` para evitar wait round-trip |
| RLS recursiva o función security definer cara en políticas | Política simplificada (0004); patrón: evitar `is_admin()` en hot paths SELECT |
| Carga inicial PWA en 3G | Bundle React optimizado, Tailwind purge, fuentes con `font-display: swap` |
| Imágenes pesadas subidas por usuarios | Validación cliente (5 MB) + límite bucket Supabase |

### 🟢 Mejoras pendientes (LOW)
- `data-testid='onboarding-logo-uploader-preview'` no expuesto (solo `-dropzone`).
- AI Logo modal deferred no testeado e2e (canvas-mock, sin riesgo).
- Falta cache-busting en `service-images` / `product-images` cuando se reemplaza (hoy se sobreescribe path).
- Falta loading de skeleton en página pública para usuarios autenticados antes de timeout (renderiza skeleton card pero podría ser más cinematográfico).

---

## 12 · ROADMAP

### P0 · Bloqueadores inmediatos
- [ ] **Usuario ejecuta `0004_fix_salons_rls.sql`** → desbloquea Discover/PublicSalon para authenticated
- [ ] Verificar Discover authed → grid renderiza < 5 s
- [ ] Verificar PublicSalon authed para `/discover/{own-slug}` del owner

### P1 · IA real (siguiente fase)
- [ ] **Roomie Vision real** — multimodal (selfie → propuesta look/color/makeup)
- [ ] **AI Logo Studio real** — reemplazar canvas por modelo multimodal
- [ ] **AI Product Extraction (imagen)** — vision → autofill modal de productos
- [ ] **AI Product Extraction (URL)** — scrape + LLM → autofill
- [ ] **Service suggestions** — panel "Roomie sugiere…" en `/salon`

### P2 · Producto operativo
- [ ] **Calendar view** para `/salon/agenda` con drag&drop de citas
- [ ] **Booking real** desde `/discover/:slug` (bottom-sheet con servicios + slot picker)
- [ ] **Onboarding emocional 3 pasos** para clientas (hair + skin + lifestyle → `client_profiles` + `hair_profiles`)
- [ ] **Roomie Chat** (concierge multi-turn con `roomie_personality`)
- [ ] **Push notifications** PWA

### Future Vision
- [ ] **Stripe + MercadoPago** con suscripciones por salón
- [ ] **Promo codes** y campañas estacionales
- [ ] **Analytics avanzados** (cohort de clientas, LTV, embudo por categoría)
- [ ] **Inventario** y reposición automática de productos
- [ ] **Team management** (estilistas con calendarios propios)
- [ ] **Reviews / ratings** públicos por salón
- [ ] **Marketplace de productos** cross-salón
- [ ] **Roomie Academy** (cursos vendibles)
- [ ] **App nativa** iOS/Android compilada desde la PWA

---

## 13 · SAAS STRATEGY

> ⚠️ Modelo propuesto · pendiente validación con primeros 10 salones.

### Plan **Free** (Discovery)
- 1 salón
- 5 servicios + 5 productos
- Página pública `/discover/:slug` con branding básico
- Solo email login (sin Google)
- Sin IA
- Sin agenda compartida

### Plan **Standard** · $29/mes
- Hasta 20 servicios + 20 productos
- Agenda básica + reservas WhatsApp
- Google OAuth para clientas
- Logo Studio con paletas premium
- Branding completo (colores + slug + personality)
- Discover destacado (sort por recencia)

### Plan **Pro** · $79/mes
- Servicios y productos ilimitados
- Calendar avanzado (multi-staff)
- Push notifications
- Roomie Vision real (selfie → propuesta)
- AI Product Extraction (imagen + URL)
- Service Suggestions
- Analytics básicos
- Sponsored placement en Discover (1 destacado/semana)

### Plan **Premium IA** · futuro · $199+/mes
- Roomie Chat 24/7 (concierge IA en el tono del salón)
- IA Logo Studio multimodal sin límites
- Recomendaciones de upsell basadas en historial
- Generación de campañas (texto + visuales) para Instagram/Email
- A/B testing de mensajes y precios
- API privada para integraciones del salón

### Add-ons (cross-plan)
- Custom domain (`tu-salon.com` → `/discover/tu-salon`) · $9/mes
- White-label PWA (sin branding Roomie) · $49/mes
- Pagos Stripe con cuenta conectada · % por transacción

---

## 14 · DEMO FLOW

> Flujo ideal de 4 minutos para presentar Roomie a un salón premium.

### Paso 1 · Crear cuenta (`/signup`)
- "Soy Valentina, propietaria de Aurora Beauty Lab. Me registro como **Propietaria de salón** con mi email."
- Click → trigger `handle_new_user` → `profiles` provisionado.

### Paso 2 · Crear salón (`/onboarding/salon`)
- Roomie me lleva directo al onboarding.
- Escribo "**Aurora Beauty Lab**", slug auto-generado `aurora-beauty-lab`.
- Selecciono paleta **Magenta**, dejo personalidad por defecto ("alegre", "emocional", "soft luxury").

### Paso 3 · Subir logo
- Drag&drop de mi logo (PNG 512×512).
- Preview inmediata (modo deferred — todavía no toca Supabase).
- O alternativamente: click "**Crear logo con IA**" → genero monograma en 3 segundos.
- Click "**Crear salón**" → RPC atómica → upload del logo a `salon-logos/{salon_id}/` → `UPDATE salons` → redirect a `/salon`.

### Paso 4 · Crear servicios
- En `/salon/services`: click "Nuevo servicio".
- "Balayage premium" / categoría Cabello / 180 min / $3,500 MXN / image upload.
- Toggle "activo" ON.
- Repito con 3 servicios más en distintas categorías (uñas, facial, makeup).

### Paso 5 · Crear productos
- En `/salon/products`: click "Nuevo producto".
- "Hidratación Olaplex" / marca "Olaplex" / $1,200 / `recommended_for: [seco, teñido]` / image upload.
- 2–3 productos más.

### Paso 6 · Cambiar a clienta (Discover)
- Logout. Signup como `cliente@demo` rol **Clienta**.
- Llego a `/app` → click "Descubre salones".
- En `/app/discover` veo **Aurora Beauty Lab** en una card luxury con su gradiente magenta y mi logo.
- Click en la card.

### Paso 7 · Public salon (`/discover/aurora-beauty-lab`)
- Hero gigante con el gradient del salón + logo + chips de personalidad.
- 4 servicios destacados con sus imágenes.
- 3 productos destacados.
- Footer "Powered by Roomie".

### Paso 8 · WhatsApp CTA
- Click "**Reservar por WhatsApp**" → abre `wa.me/+52...?text=Hola, vengo desde Roomie y quiero reservar en Aurora Beauty Lab.`
- Cierre: "En 4 minutos Aurora pasó de 0 a una experiencia premium operable, descubrible y reservable. Sin diseñador. Sin developer."

---

## 15 · ARCHIVOS DE REFERENCIA

### Documentación
- `/app/PROJECT_MANIFEST.md` (este archivo)
- `/app/AI_ROADMAP.md`
- `/app/memory/PRD.md`
- `/app/memory/test_credentials.md`
- `/app/test_reports/iteration_4.json`, `iteration_5.json`

### Migrations
- `/app/supabase/migrations/0001_initial.sql`
- `/app/supabase/migrations/0002_create_my_salon.sql`
- `/app/supabase/migrations/0003_storage_and_catalog.sql`
- `/app/supabase/migrations/0004_fix_salons_rls.sql`

### Pages clave
- `/app/frontend/src/pages/onboarding/OnboardingSalon.jsx`
- `/app/frontend/src/pages/client/Discover.jsx`
- `/app/frontend/src/pages/PublicSalon.jsx`
- `/app/frontend/src/pages/salon/SalonOverview.jsx`

### Components / Lib
- `/app/frontend/src/components/ImageUploader.jsx`
- `/app/frontend/src/components/AILogoModal.jsx`
- `/app/frontend/src/lib/storage.js`
- `/app/frontend/src/lib/ai.js`
- `/app/frontend/src/context/AuthContext.jsx`

---

_Documento mantenido vivo. Última actualización: 2026-02-15 · Fase Final 1A._
