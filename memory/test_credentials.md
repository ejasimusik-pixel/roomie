# Roomie · Test Credentials

> Para demos públicas. Los usuarios `qa+...@example.com` se crean dinámicamente.
> Estos seeds son los recomendados para presentación.

## Live Supabase project
- URL: `https://dxfqnwdwqmuyyzpdlgcl.supabase.co`
- Las cuentas se crean vía `/signup` (Auth real). El trigger `handle_new_user` aprovisiona automáticamente la fila en `profiles`.

## Suggested demo accounts to create live during the presentation
| Role | Email pattern | Password |
|---|---|---|
| Cliente | `cliente.demo@roomie.app` | `Roomie2026!` |
| Salón owner | `valentina@aurorabeauty.lab` | `Roomie2026!` |
| Admin (interno) | `admin@roomie.app` | `Roomie2026!` |

## Demo flag overrides (localStorage)
| Key | Value | Effect |
|---|---|---|
| `roomie.tutorial.seen.client` | `done` / `skipped` | Skip First-Time Tutorial para cliente |
| `roomie.tutorial.seen.salon_owner` | `done` / `skipped` | Skip First-Time Tutorial para salón |
| `roomie_ai_model` | model id de OpenRouter | Pre-seleccionar modelo en AI Studio |
| `roomie.pwa.install.dismissed` | `1` | Ocultar tarjeta de instalación PWA |

## OpenRouter
- Key vive solo en `frontend/.env` como `VITE_OPENROUTER_API_KEY` (no se commitea).
- Modelos activos verificados (HTTP 200 contra `openrouter.ai/api/v1/chat/completions`):
  - `google/gemini-2.5-flash`
  - `anthropic/claude-sonnet-4.5`
  - `anthropic/claude-opus-4`
  - `meta-llama/llama-3.3-70b-instruct:free`

_Last update: 2026-05-18_
