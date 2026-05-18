# ROOMIE: MASTER HANDOFF DOCUMENT

## VISION

Roomie no es software para salones. Es el primer acompañante de belleza en la era aspiracional (**Luxury Wellness App / AI Beauty Companion**). Es la intersección donde la inteligencia conversacional y el diseño cinemático se encuentran para erradicar el concepto de los turnos aburridos y convertirlos en _Glow Journeys_.

## IDENTIDAD

- **Roomie NO es SaaS tradicional**: No somos un clon utilitario, somos lujo. Nos inspiramos en Headspace y Glossier, no en Excel ni Jira.
- **Rituals > Tasks**: Nos enfocamos profundamente en rutinas que generan apego emocional. Las clientas no "marcan pasos", inician "Beauty Rituals".
- **Concierge > Chatbot**: Roomie es confidente, cálida y expertamente reservada. Escribe corto, conciso y empático. Nunca admite ser un robot ("Soy tu concierge de lujo").
- **Emotional UX First**: Todas las interfaces apelan a calma, aire y fluidez (Shadows sutiles, Glassmorphism blando, y mucho spacing).

## ARQUITECTURA "FREEZADA"

- **Frontend Core**: Single Page Application en ReactJS 18.
- **Runtime Definitivo**: Migrado desde `create-react-app` hacia la absoluta hiper-velocidad de **Vite** HMR y ESM modularing puro.
- **Auth & Storage Backend**: Supabase (Usando la capa _Mock client interface_ para demo fluida desconectada).
- **Core IA**: OpenRouter Agnosticism Core (`lib/ai/openrouter.js`). Tolerante a latencia y cross-model compatible.
- **AI Studio**: (Herramienta Interna). Registry de modelos inyectados en la UI para rotar dinámicamente según la fase de testeo (Fast/Premium/Creative).
- **Contexto**: "Memory-Lite". Variables de estado local para simular la omnisciencia de Roomie adaptando la _Dual-Persona_ según si el login es de Clienta o Directora.

## ENVIRONMENT

El sistema se nutre de inyecciones estandarizadas `import.meta.env.VITE_X`.  
Tu `.env` raíz en la compilación final y en Vercel/Netlify debe tener exactamente:

```env
VITE_SUPABASE_URL=[tu-url]
VITE_SUPABASE_ANON_KEY=[tu-anon-key]
VITE_OPENROUTER_API_KEY=[tu-openrouter-key]
```

> Nada de dependencias Legacy (`REACT_APP_` fue purgado).

## AI SYSTEM BEHAVIOR

- **Mode Clienta**: Habla de haircare, glow y outfits (Outfit Assistant via Multimodalidad).
- **Mode Salón**: Brinda coaching directo de upselling y redacta menús de diseño (ej. _Golden Hour Balayage_).
- **Multimodalidad In-app**: Lee componentes base64 directamente usando el plugin nativo de Vite y empaquetándolo en arrays `image_url` hacia Anthropic/OpenAI, brindándole "ojos" reales al Concierge.

## ROADMAP (LO QUE SE CONCIBIÓ Y COMPLETÓ) ✅

1. Arquitectura de Mock Subscriptions (Feature Gating y Fake Apple Pay).
2. Seed Scripts inyectables SQL para generar demos (Ej. _ColorRoom / Vicnnel_).
3. "Roomie Sugiere" & AI Autofill Product parsing.
4. Daily Glow Flow (ClientHome convertido en Tracker Lujoso blando).
5. OpenRouter Core con fallback gracefully timeout (15s limits).
6. Dual Persona Chat Cinematográfico.
7. Migración y estabilización definitiva a Vite.

## KNOWN ISSUES ACTUALES

- Si se usa un modelo que NO soporta Visión en `AI Studio` e intentan mandar una foto Multimodal en el Chat, puede reventar un Error 400 de OpenRouter. Es deber asegurar usar Opus/Sonnet/GPT4o.
- Memory Lite es volátil (vive en cache del navegador por conveniencia DEMO).
- Límites Diarios (Tiers) emulados.
- PWA utiliza íconos por defecto de Create-React-App y deben ser suplantados por las marcas de agua de Vicnnel y logos `png` en un pase futuro.

## FUTURE (LO QUE SIGUE EN EMERGENT)

- **Migración a Producción Stripe**: El componente `Fake Checkout` debe conectarse con el API Real (Webhooks a Supabase).
- **Auto-Routing Mágico**: Erradicar el botón _AI Studio_ y crear un router en Edge Functions que decida ocultamente qué modelo usar dependiendo del prompt (economizando tokens).
- **Embeddings & Catálogo Local**: Entrenar a Claude con la ficha PDF real de precios de _ColorRoom_ vía `RAG`.
