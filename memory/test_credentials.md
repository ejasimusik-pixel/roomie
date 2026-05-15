# ROOMIE — Test Credentials

> Estos usuarios se siembran automáticamente en `localStorage` la primera vez que se
> carga la app, mientras `REACT_APP_SUPABASE_URL` esté vacío (modo demo).
> Cuando se conecte Supabase real, estos accesos dejarán de funcionar y habrá que
> recrearlos en el dashboard de Supabase Auth con los mismos metadatos.

## Demo Accounts (modo demo / mock localStorage)

| Rol           | Email                  | Password      | salon_id        |
| ------------- | ---------------------- | ------------- | --------------- |
| `client`      | cliente@roomie.demo    | Roomie2026!   | (null)          |
| `salon_owner` | salon@roomie.demo      | Roomie2026!   | salon-aurora    |
| `admin`       | admin@roomie.demo      | Roomie2026!   | (null)          |

## Rutas de cada rol (post-login)

| Rol           | Landing tras login | Permisos                                                                 |
| ------------- | ------------------ | ------------------------------------------------------------------------ |
| client        | `/app`             | `/app/*`. No accede a `/salon` ni `/admin` (redirige a `/unauthorized`). |
| salon_owner   | `/salon`           | `/salon/*` y `/app/*`. No accede a `/admin`.                             |
| admin         | `/admin`           | `/admin/*`, `/salon/*` y `/app/*`.                                       |

## Reset de datos demo

Para limpiar todos los usuarios y sesiones demo:

```js
localStorage.removeItem('roomie.demo.users');
localStorage.removeItem('roomie.demo.session');
location.reload();
```

Los 3 usuarios se vuelven a sembrar automáticamente.
