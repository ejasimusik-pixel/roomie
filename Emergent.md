# EMERGENT CONTINUATION HANDOFF

_(Documento Técnico para el Agente AI Entrante ("Emergent"))_

¡Hola, compañero Agente! Estás heredando el código base de "Roomie Experience" después de la fase intensiva de arquitectura y "Emotional UX" de Antigravity (Gemini). Complementariamente a la visión del producto alojada en `GEMINI.md`, este documento sirve como tu mapa técnico estricto de restricciones y estado actual de la plataforma para no romper lo construido.

## 1. TECHNICAL CONTEXT & BUILD SYSTEM (VITE)

**CRÍTICO:** Este proyecto fue migrado radicalmente de `create-react-app` a `Vite`.

- **Regla de Entorno:** BAJO NINGUNA CIRCUNSTANCIA uses `process.env`. Todas las nuevas variables de entorno deben prefijarse con `VITE_` y leerse vía `import.meta.env` (Ej. `import.meta.env.VITE_OPENROUTER_API_KEY`).
- **Regla JSX:** Vite utiliza `esbuild`, el cual falla si hay sintaxis JSX dentro de un archivo `.js`. Nuestro `index` y `App` ya fueron renombrados a `.jsx`. Todo nuevo componente debe ser `.jsx`.

## 2. MOCKED INFRASTRUCTURE (DEMO FALLBACKS)

La base actual opera bajo un sistema de "Mock" (Falsificación segura para demostraciones en vivo):

- **Mock Auth/DB**: Revisa `frontend/src/lib/supabase.js`. Si las llaves de Supabase faltan en el `.env`, el sistema activa un cliente en memoria/localStorage perfecto para demos. No rompas esta caída segura a menos que la base de datos esté lista para PRD.
- **Mock Subscriptions**: Las suscripciones Pro se procesan mediante Apple Pay emulado en UI (`CheckoutMockModal.jsx`).

## 3. OPENROUTER & AI CORE (`lib/ai/openrouter.js`)

- **Agnosticismo**: Utilizamos OpenRouter (no la API estricta de OpenAI). Hay un Registry `AI_MODELS` interno que balancea Flash/Sonnet/Opus.
- **Multimodalidad Pura Integrada**: En `RoomieChat.jsx`, hemos incorporado lectura Base64. Si la usuaria sube una foto, la UI la convierte nativamente usando `FileReader` y la inyecta al payload JSON hacia OpenRouter como `image_url`. _(Atención: Evitar rutear modelos pequeños que no tengan Vision cuando detectes `type="file"`, o lanzará Error 400)._
- **Dual Persona Prompts**: Roomie adapta sus _System Prompts_ dinámicamente si el rol es "Salon" o "Client". Esos prompts fueron altamente calibrados para mantener respuestas hiper-cortas, estéticas y cero-robóticas. Mantenlos bajo esa filosofía.

## 4. CONTEXT & MEMORY LITE (`hooks/useMemoryLite.js`)

- Actualmente el contexto que la IA "recuerda" sobre las clientas (ej. Cabello fino, Salón Favorito) vive temporalmente alojado en el Local Storage.

## 📌 PRÓXIMAS MISIONES PARA EMERGENT (BACKLOG FUTURO)

Cuando entres, estas son tus áreas directas de ataque:

- [ ] **Stripe V2**: Desinstalar el Mock Apple Pay y conectar un Webhook oficial contra Supabase para registrar Pagos Pro reales.
- [ ] **Supabase Storage**: Subir las imágenes del chat a S3/Supabase en lugar de inyectar Strings pesados Base64 a OpenRouter en cada ciclo para economizar la latencia del chat.
- [ ] **Memory Lite to RLS**: Mover las preferencias capilares y de salón de Local Storage a la tabla `client_profiles`.
- [ ] **PWA Assets**: Eliminar los resquicios de iconos CRA del `public/manifest.json` y sustituirlos por verdaderos iconos de ColorRoom/Vicnnel para el instalador app del User.
- [ ] **Auto-Routing de Tokens**: Suprimir el Toggle Manual del UI de qué IA usar. Construir una capa intermedia que dictamine usar Flash-8b cuando el prompt sea simple, y escalar silenciosamente a Claude Opus/Sonnet si lleva una foto o pide tareas densas.

¡Mucha suerte! Mantén **siempre** la atmósfera "Luxury Minimalist" viva.
