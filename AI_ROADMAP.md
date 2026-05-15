# ROOMIE — AI ROADMAP
> Visión completa de inteligencia artificial · v1 · Feb 2026

---

## 1 · FILOSOFÍA IA DE ROOMIE

> _Roomie no es un wrapper de ChatGPT. Es un sistema operativo de belleza que usa IA como músculo invisible._

### Principios
1. **IA invisible, valor visible** — el usuario nunca debería leer "consultá nuestra IA". Debería sentir que la app "le adivina la intención".
2. **Personalidad por salón** — cada uso de IA respeta `roomie_personality` (tone, style, emoji_level, sales_style). Aurora Beauty Lab no suena como Noir Concept.
3. **Multimodal-first** — la belleza es visual. Casi todo flujo IA acepta imagen como entrada o produce imagen como salida.
4. **Sin lock-in de proveedor** — todos los hooks viven detrás de `lib/ai.js` con contratos estables; el modelo se cambia sin tocar UI.
5. **Crédito-eficiente** — modelos baratos para flujos rutinarios (autofill, clasificación), modelos premium solo para generación que el usuario "ve y siente".
6. **Privacidad clínica** — selfies y datos sensibles (`hair_profiles`, `client_profiles`) nunca se mandan a un modelo que entrene con ellos. Solo modelos con opt-out garantizado.

---

## 2 · ESTADO ACTUAL (Feb 2026)

| Flujo | Estado | Notas |
|---|---|---|
| `lib/ai.js` scaffolding | ✅ Listo | Stubs vendor-agnostic, retornan `{ data: null, mocked: true }` |
| Roomie Vision UI | ✅ Mock UI | Upload selfie → bucket privado → propuesta fake premium |
| AI Logo Studio UI | ✅ Mock canvas | 4 estilos × 6 paletas + monograma; subir al bucket |
| `roomie_personality` storage | ✅ jsonb en `salons` | tone/style/emoji_level/sales_style; alimenta system prompts futuros |
| `client-uploads` bucket privado | ✅ Listo | Signed URLs 1h; ideal para vision multimodal |
| Roomie Concierge real | ❌ No iniciado | |
| Product extraction (imagen) | ❌ No iniciado | Hook ya definido |
| Product extraction (URL) | ❌ No iniciado | Hook ya definido |
| Service suggestions | ❌ No iniciado | Hook ya definido |
| AI Vision real | ❌ No iniciado | UI lista, falta wire |
| AI Logo real | ❌ No iniciado | UI lista, falta wire |

---

## 3 · ARQUITECTURA TÉCNICA IA

### Capas
```
┌─────────────────────────────────────────────────────────┐
│ React PWA (Frontend)                                    │
│   - lib/ai.js  →  contratos estables (no provider info) │
│   - hooks por feature: useLogoAI, useVisionAI, etc.     │
└───────────┬─────────────────────────────────────────────┘
            │ supabase.functions.invoke('ai-extract-product', { ... })
            ▼
┌─────────────────────────────────────────────────────────┐
│ Supabase Edge Functions (Deno serverless)               │
│   - ai-extract-product-image / -url                     │
│   - ai-vision-look                                      │
│   - ai-logo-generate                                    │
│   - ai-suggest-services                                 │
│   - ai-roomie-reply                                     │
│   Cada función:                                         │
│     1. Verifica JWT y permisos RLS-equivalentes         │
│     2. Lee `salons.roomie_personality` si aplica        │
│     3. Llama al modelo correcto vía Emergent LLM Key    │
│     4. Devuelve JSON tipado                             │
└───────────┬─────────────────────────────────────────────┘
            │ HTTPS + EMERGENT_LLM_KEY (secret en Supabase)
            ▼
┌─────────────────────────────────────────────────────────┐
│ Modelos (Emergent Universal Key)                        │
│   - Claude Sonnet 4.5  (texto, razonamiento)            │
│   - Gemini 3 / Nano Banana (texto + imagen gen)         │
│   - GPT-4o / GPT-Image 1 (texto + imagen)               │
│   - Sora 2 (video)                                      │
│   - Whisper (audio → texto)                             │
└─────────────────────────────────────────────────────────┘
```

### `lib/ai.js` — contratos definidos
```js
extractProductFromImage(file)
   → { name, brand, type, recommended_for[], confidence }

extractProductFromUrl(url)
   → { name, brand, type, price_estimate, image_url, recommended_for[] }

suggestServicesForSalon(salon, existingServices)
   → { suggestions: [{ category, name, rationale, est_price }] }

composeRoomieReply(salon, context)
   → { reply, suggested_actions[], suggested_services[] }

// Futuros (próxima iteración)
proposeLookFromSelfie(selfie_signed_url, client_profile?)
generateLogo(name, style, palette)
classifyServiceCategory(name, description)
forecastDemand(salon_id, horizon_days)
```

---

## 4 · FLUJOS IA PRIORIZADOS

### 🟣 P1 · Quick wins (alta utilidad, bajo costo)

#### 4.1 · Product Extraction por imagen
**Problema**: agregar un producto a mano es tedioso (8 campos).
**Solución**: la dueña sube una foto del producto → IA detecta nombre, marca, tipo, tags → autofill.
- **Modelo**: Gemini 3 Flash (vision + structured output) · ~$0.001 por extracción.
- **Flujo**: `useProductExtraction` hook → Edge Function `ai-extract-product-image` → modelo con prompt JSON-schema.
- **UX**: spinner "Roomie está leyendo tu producto…" 2–3 s → form pre-rellenado con badges editables.
- **KPI**: tiempo medio de creación de producto: 90 s → 12 s.

#### 4.2 · Product Extraction por URL
**Problema**: muchas salones venden productos de tiendas online (Sephora, Mercadolibre).
**Solución**: pegar URL → IA scrape + normaliza → autofill.
- **Modelo**: Claude Sonnet 4.5 con tool use (fetch URL + parse).
- **Edge Function**: `ai-extract-product-url` con scrape + LLM cleanup.
- **UX**: input "pega un link" + chip "Roomie lo lee por ti".

#### 4.3 · Service category auto-detect
**Problema**: dueñas escriben "Highlights premium" pero olvidan marcar la categoría.
**Solución**: clasificador automático al escribir el nombre.
- **Modelo**: Claude Haiku 4.5 (clasificación barata).
- **UX**: chip categoría sugerida + 1 click para aceptar.

#### 4.4 · Service Suggestions
**Problema**: salones no saben qué les falta.
**Solución**: panel "Roomie sugiere…" en `/salon` que analiza el catálogo actual y propone 3 servicios faltantes con copy listo.
- **Modelo**: Claude Sonnet 4.5.
- **Trigger**: on mount de `/salon` (cache 24h).
- **Output**: `[{ category, name, rationale, est_price }]`.
- **Ejemplos**:
  - "Tus clientas aman balayage premium. Considera **Gloss Reflejos** ($1,200) como upsell."
  - "Ofreces uñas pero no manicura express. Las clientas que tienen poco tiempo buscan **Express Polish** ($350)."

---

### 🟣 P1 · Heavy hitters (premium experience)

#### 4.5 · Roomie Vision Multimodal (real)
**Problema**: las clientas no saben qué look les queda. Hoy es UI mock.
**Solución**: selfie → propuesta visual multimodal completa (look + color + manicura + maquillaje + mood).
- **Pipeline**:
  1. Selfie a `client-uploads/{user_id}/` con signed URL.
  2. Edge Function `ai-vision-look` recibe la signed URL.
  3. Gemini 3 (vision) analiza: tono de piel, forma de cara, longitud actual del cabello.
  4. Combina con `hair_profiles` del cliente (si existe).
  5. Genera propuesta JSON + 3 imágenes (generadas con Nano Banana).
  6. Persiste resultado en una nueva tabla `vision_proposals`.
- **Modelos**: Gemini 3 (análisis) + Nano Banana (imágenes propuesta).
- **UX**: transición cinematográfica "preparing your look" + carrusel de propuestas tappables.
- **Privacidad**: signed URL 1h; selfie nunca se entrena; resultado persiste 30 días y se borra automáticamente.

#### 4.6 · AI Logo Studio real
**Problema**: el canvas-mock actual genera monogramas, no logos reales.
**Solución**: brief → multimodal → logo profesional.
- **Modelo**: Nano Banana (imagen) con prompt construido desde `style + palette + name + brand keywords`.
- **Flujo**:
  1. Modal con 4 estilos + 6 paletas + textarea opcional "describe tu energía".
  2. Edge Function `ai-logo-generate` retorna 3 variantes.
  3. Carrusel + botón "usar este logo".
  4. Upload a `salon-logos/{salon_id}/` + `UPDATE salons.logo_url`.
- **Costo**: ~$0.04 por generación (3 variantes).
- **Diferenciador**: respeta `roomie_personality.style` y la paleta del salón → identidad visual coherente con la voz.

#### 4.7 · Roomie Concierge (chat)
**Problema**: cada salón maneja WhatsApp manualmente. No escala.
**Solución**: chat público en `/discover/:slug` con un Roomie entrenado en el tono del salón.
- **Modelo**: Claude Sonnet 4.5 (mejor en conversación + tono).
- **System prompt construido dinámicamente**:
  ```
  Eres Roomie, concierge digital de {salon.name}.
  Tono: {personality.tone} · Estilo: {personality.style}
  Emojis: {personality.emoji_level} · Venta: {personality.sales_style}
  Catálogo: {services} {products}
  Reglas: nunca prometas precios fuera del catálogo; ofrece WhatsApp para cerrar reserva.
  ```
- **UX**: bottom-sheet en mobile, sidebar en desktop, history persistido por session.
- **Convergencia**: el chat sugiere "¿quieres que la dueña te confirme por WhatsApp?" → CTA con mensaje pre-rellenado.

---

### 🟡 P2 · Inteligencia de negocio

#### 4.8 · Demand Forecasting
- Predice cuántas citas habrá la próxima semana por categoría.
- Modelo: Claude Sonnet sobre histórico de `appointments`.
- Output: dashboard "Roomie predice 18 citas de balayage la próxima semana — considera abrir agenda extra el sábado".

#### 4.9 · Client Health Score
- Por cada `client_profile`: probabilidad de retornar en 60 días.
- Inputs: última cita, categoría favorita, gap promedio entre visitas.
- Salida: chip "🔴 En riesgo · 🟡 Tibia · 🟢 Fiel".
- Acción: "Roomie sugiere mandarle un cupón de 15% — última visita hace 72 días".

#### 4.10 · Upsell Recommendations
- Al confirmar una cita, Roomie sugiere 1–2 servicios complementarios.
- Modelo: Claude Sonnet con co-ocurrencias del salón.
- Ejemplo: clienta reserva balayage → "complementa con gloss + tratamiento de hidratación: +$1,400".

#### 4.11 · Smart Pricing Suggestions
- Analiza precios del salón vs categoría/ciudad/competencia.
- Recomienda subir/bajar precio con confidence.
- Modelo: Claude Sonnet + (futuro) datos de marketplace cross-salón.

#### 4.12 · Campaign Generator
- Genera campañas estacionales completas: copy IG, copy email, imagen de portada.
- Inputs: salón + temporada + objetivo (retención / adquisición / upsell).
- Modelos: Claude Sonnet (texto) + Nano Banana (visuales).
- Output: paquete listo para descargar/programar.

---

### 🟢 Future Vision · IA conversacional avanzada

#### 4.13 · Roomie Voice (TTS + STT)
- Clientas que prefieren hablar (mientras manejan / hacen ejercicio).
- Pipeline: Whisper STT → Claude → ElevenLabs TTS (voz del salón).
- Cada salón puede entrenar una voz personalizada premium.

#### 4.14 · Video Look Try-On
- Modelo: Sora 2 corto (3-5 s).
- Clienta sube selfie + se ve a sí misma con el look propuesto.
- Costo alto → solo en plan Premium IA.

#### 4.15 · Mirror Mode (live AR)
- Cámara en vivo + overlay con look propuesto.
- Pipeline: vision frame-by-frame + segmentación + overlay (probable colaboración con SDK externo tipo MediaPipe).

#### 4.16 · Sales Coach
- Analiza chats reales (con permiso) y devuelve coaching: "esta clienta estaba lista para upsell, no le ofreciste nada".
- Modelo: Claude Sonnet sobre transcripciones.
- Sensibilidad alta: opt-in explícito.

---

## 5 · INTEGRACIÓN PASO A PASO (próxima fase)

### Hito 1 · Wiring infrastructure (1 sprint)
- [ ] Crear Supabase Edge Functions: `ai-extract-product-image`, `ai-extract-product-url`, `ai-suggest-services`, `ai-vision-look`, `ai-logo-generate`, `ai-roomie-reply`.
- [ ] Secret `EMERGENT_LLM_KEY` configurado en Supabase Functions.
- [ ] Helper `lib/ai.js` actualizado para llamar `supabase.functions.invoke(...)`.
- [ ] Tabla `ai_logs` (audit + cost tracking).

### Hito 2 · Quick wins (1 sprint)
- [ ] Product Extraction por imagen integrado en modal de productos.
- [ ] Product Extraction por URL idem.
- [ ] Service category auto-detect en modal de servicios.
- [ ] Service suggestions panel en `/salon`.

### Hito 3 · Heavy hitters (2 sprints)
- [ ] Roomie Vision real en `/app/vision`.
- [ ] AI Logo Studio real (reemplaza canvas).
- [ ] Roomie Concierge chat en `/discover/:slug`.

### Hito 4 · BI inteligente (2 sprints)
- [ ] Tabla `vision_proposals` con TTL.
- [ ] Demand forecasting weekly job.
- [ ] Client health score (cron diario).
- [ ] Upsell suggestions on appointment confirm.

### Hito 5 · Future Vision (rolling)
- [ ] Roomie Voice (TTS + STT).
- [ ] Video try-on con Sora 2.
- [ ] Campaign generator.

---

## 6 · MODELOS Y COSTOS ESTIMADOS

| Flujo | Modelo | Costo/uso aprox | Frecuencia/mes (por salón Pro) | Costo mensual estimado |
|---|---|---|---|---|
| Product extraction imagen | Gemini 3 Flash | $0.001 | 20 productos | $0.02 |
| Product extraction URL | Claude Sonnet 4.5 | $0.005 | 10 URLs | $0.05 |
| Service suggestions | Claude Sonnet 4.5 | $0.01 (cached 24h) | 30 vistas | $0.10 (cached) |
| Roomie Vision | Gemini 3 + Nano Banana ×3 | $0.12 | 50 selfies | $6.00 |
| Logo Studio | Nano Banana ×3 | $0.04 | 2 generaciones | $0.08 |
| Roomie Concierge chat | Claude Sonnet 4.5 | $0.02/conv | 200 conversaciones | $4.00 |
| **Total estimado salón Pro** | | | | **~$10.25/mes** |

> Con plan Pro a **$79/mes**, margen IA: **87%+**. Plan Premium IA a $199/mes deja >90% margen incluso con video try-on.

---

## 7 · GUARDRAILS Y PRIVACIDAD

### Datos sensibles
- Selfies de clientas: bucket privado · signed URL 1h · borrado automático a los 30 días.
- `hair_profiles` y `client_profiles`: nunca en prompts cross-salón.
- Chat history del concierge: opt-in explícito para ser usado en mejoras.

### Hallucination control
- Roomie nunca inventa servicios fuera del catálogo del salón.
- Precios siempre tomados de DB, jamás generados por LLM.
- En caso de duda → "déjame conectarte con la dueña por WhatsApp".

### Cost protection
- Rate limiting por salón en cada Edge Function.
- Daily budget cap por plan (free=$0, standard=$2, pro=$15, premium IA=$50).
- Alerta automática si el cap se aproxima.

### Auditoría
- Tabla `ai_logs`: timestamp, salón, función, modelo, tokens in/out, costo, latencia, success.
- Dashboard admin con cohort de costo por feature.

---

## 8 · DIFERENCIADORES IA vs. competencia

| Feature | Roomie | Booksy | Fresha | Instagram |
|---|---|---|---|---|
| Personalidad por marca | ✅ | ❌ | ❌ | ❌ |
| Vision multimodal | ✅ (planeado) | ❌ | ❌ | ❌ |
| Autofill IA productos | ✅ (planeado) | ❌ | ❌ | ❌ |
| Concierge chat con tono salón | ✅ (planeado) | ❌ | ❌ | ❌ |
| Logo Studio integrado | ✅ (planeado) | ❌ | ❌ | ❌ |
| Recomendaciones servicios | ✅ (planeado) | ❌ | parcial | ❌ |
| WhatsApp deeplink integrado | ✅ | parcial | ❌ | manual |

---

## 9 · NORTHSTAR METRICS IA

| Métrica | Target Q1 | Target Q3 |
|---|---|---|
| % salones con logo IA | n/a | 60% |
| Productos creados con IA | n/a | 40% del catálogo |
| Sesiones Roomie Vision por clienta/mes | n/a | 1.5 |
| Conversión `Vision → WhatsApp` | n/a | 25% |
| Conversaciones del concierge → reserva | n/a | 18% |
| Satisfacción IA (NPS interno) | n/a | 60+ |

---

## 10 · DECISIONES ABIERTAS

1. **¿Edge Functions vs. backend dedicado?** — proponemos Edge Functions por simplicidad y proximidad a la DB. Backend dedicado solo si necesitamos colas o procesos largos (>30 s).
2. **¿Cuándo introducir Premium IA tier?** — sugerencia: cuando Roomie Vision real esté validada con 20+ salones y haya datos de uso.
3. **¿Modelo único o multi-modelo por feature?** — multi-modelo: usar el más barato por tarea (Haiku para clasificación, Sonnet para razonamiento, Gemini para vision, Nano Banana para imagen).
4. **¿Training propio?** — NO inicialmente. RAG sobre datos del salón es suficiente. Fine-tuning queda para >100 salones.

---

_Documento mantenido vivo · v1 · 2026-02-15_
