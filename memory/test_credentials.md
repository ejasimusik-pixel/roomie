# ROOMIE — Test Credentials

> **Estado actual**: Supabase real está conectado (`dxfqnwdwqmuyyzpdlgcl.supabase.co`).
> Las credenciales demo en localStorage **ya no funcionan** porque la app ahora
> usa el cliente real de Supabase, NO el mock.

## Backend conectado
- **SUPABASE_URL**: `https://dxfqnwdwqmuyyzpdlgcl.supabase.co`
- **SUPABASE_ANON_KEY**: `sb_publishable_P7JnJVV1mR1QS_F8I4gifA_X7Isz68K` (publishable — segura para browser)
- Configuradas en `/app/frontend/.env`.

## Cómo crear cuentas de prueba

1. Ejecutar la migración `0001_initial.sql` en el SQL Editor de Supabase.
2. En la app (`/signup`), registrar 1 cuenta por rol:
   - Una con rol `Clienta` → quedará en `profiles` con `role = 'client'`.
   - Una con rol `Propietaria de salón` → quedará con `role = 'salon_owner'`, `salon_id = NULL`.
3. **Promover una cuenta a admin** desde el SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'tu-email@example.com';
   ```
4. **Asignar un salón a la propietaria** (después de crear el salón):
   ```sql
   -- Primero crea el salón:
   insert into public.salons (name, slug) values ('Aurora Beauty Lab', 'aurora-beauty-lab') returning id;
   -- Luego asigna a la propietaria (sustituye los UUIDs):
   update public.profiles set salon_id = '<SALON_UUID>' where email = 'salon@example.com';
   ```

## Rutas por rol (post-login)
| Rol           | Landing tras login | Permisos                                  |
| ------------- | ------------------ | ----------------------------------------- |
| `client`      | `/app`             | sólo `/app/*`                             |
| `salon_owner` | `/salon`           | `/salon/*` y `/app/*`                     |
| `admin`       | `/admin`           | acceso total                              |

## Volver a modo demo (si necesitas testear sin Supabase)

Vacía las variables en `/app/frontend/.env`:
```
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
```
Reinicia frontend (`sudo supervisorctl restart frontend`). Las 3 cuentas demo
(`cliente@roomie.demo`, `salon@roomie.demo`, `admin@roomie.demo` con pass
`Roomie2026!`) volverán a sembrarse automáticamente en localStorage.
