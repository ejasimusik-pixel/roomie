# ROOMIE — Test Credentials

> **Estado actual**: Supabase real conectado (`dxfqnwdwqmuyyzpdlgcl.supabase.co`).

## Backend
- **SUPABASE_URL**: `https://dxfqnwdwqmuyyzpdlgcl.supabase.co`
- **SUPABASE_ANON_KEY**: `sb_publishable_P7JnJVV1mR1QS_F8I4gifA_X7Isz68K`
- Configuradas en `/app/frontend/.env`.

## Cuentas reales creadas

| Email | Password | Rol | Salón |
| ----- | -------- | --- | ----- |
| `test_salon_pahebpcu@roomie.test` | `Roomie2026!` | `salon_owner` | `aurora-qa-pahebpcu` (id `d7ebff18-f707-42d7-b9d8-8d752b6289f0`) |

> Esta cuenta fue creada durante el testing del flujo de onboarding + logo deferred upload. Tiene logo PNG real en `salon-logos/d7ebff18-.../...png` y se puede usar para validar Discover, PublicSalon y el flujo entero.

## Cómo crear cuentas adicionales

1. Migraciones requeridas en Supabase SQL Editor (en orden):
   - `0001_initial.sql`
   - `0002_create_my_salon.sql`
   - `0003_storage_and_catalog.sql`
   - **`0004_fix_salons_rls.sql`** (CRÍTICA para que Discover funcione con authenticated users)

2. En `/signup` registrar la cuenta deseada y seleccionar rol.

3. (Opcional) Promover a admin desde SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'tu-email@example.com';
   ```

## Rutas por rol (post-login)
| Rol | Landing tras login | Permisos |
| --- | ------------------ | -------- |
| `client` | `/app` | `/app/*` |
| `salon_owner` | `/salon` | `/salon/*` + `/app/*` |
| `admin` | `/admin` | acceso total |

## Rutas públicas (sin login)
- `/discover/:slug` — perfil público de cualquier salón activo

## Bug crítico activo (pendiente fix manual de SQL)
Si los usuarios autenticados ven "Reintentar" en `/app/discover` o "No pudimos cargar el salón" en `/discover/:slug` → falta correr `0004_fix_salons_rls.sql` en Supabase SQL Editor.
