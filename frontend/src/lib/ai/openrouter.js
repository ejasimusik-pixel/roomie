/**
 * Roomie - OpenRouter Core Abstraction
 * Handles interaction with OpenRouter AI for Dual Persona capabilities.
 */

// Model Registry (verified active on OpenRouter · 2026)
// Visual meters (0-3): speed, quality, costLevel
export const AI_MODELS = {
  FAST: {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    label: "Rápido",
    badge: "⚡",
    category: "Rápido ⚡",
    description: "Latencia mínima. Ideal para charlas dinámicas y respuestas inmediatas.",
    tagline: "El default sereno · pensado para fluir.",
    speed: 3,
    quality: 2,
    costLevel: 1,
    accent: "from-amber-200 to-yellow-100",
    iconColor: "text-amber-500",
  },
  PREMIUM: {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    label: "Premium",
    badge: "✨",
    category: "Premium ✨",
    description: "El equilibrio luxury: emoción, criterio y velocidad respetuosa.",
    tagline: "El concierge sofisticado · para conversaciones con alma.",
    speed: 2,
    quality: 3,
    costLevel: 2,
    accent: "from-pink-200 to-magenta-100",
    iconColor: "text-magenta-500",
  },
  CREATIVE: {
    id: "anthropic/claude-opus-4",
    name: "Claude Opus 4",
    label: "Creativo",
    badge: "🎨",
    category: "Creativo 🎨",
    description: "Máxima inteligencia. Copywriting, naming y estrategia premium.",
    tagline: "El cerebro estratégico · cuando todo importa.",
    speed: 1,
    quality: 3,
    costLevel: 3,
    accent: "from-violet-200 to-violet-100",
    iconColor: "text-violet-500",
  },
  ECONOMIC: {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    label: "Económico",
    badge: "💸",
    category: "Económico 💸",
    description: "Modelo gratuito de alta capacidad. Perfecto para tests y demos.",
    tagline: "Modo zen · sin costo, sin presión.",
    speed: 2,
    quality: 2,
    costLevel: 0,
    accent: "from-emerald-200 to-emerald-100",
    iconColor: "text-emerald-500",
  }
};

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export async function fetchOpenRouterChat(messages, options = {}) {
  const model = options.model || AI_MODELS.FAST.id;
  const temperature = options.temperature || 0.7;
  
  if (!OPENROUTER_API_KEY) {
    console.warn("VITE_OPENROUTER_API_KEY is not defined. Using mock response.");
    await new Promise(r => setTimeout(r, 1500));
    return "Estoy en modo prueba. Tu API key de OpenRouter no está configurada, pero prometo que cuando despierte, nuestra charla será mágica ✨.";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": window.location.href, // Required by OpenRouter
        "X-Title": "Roomie App", 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
    
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn("OpenRouter Request timed out.");
      return "Mi servidor de concierge está súper ocupado ahora mismo. Dame un ratito y vuelvo a brillar para ti ✨.";
    }
    console.error("AI Core Error:", err);
    return "Ups, los cables del camerino se enredaron. Intentemos de nuevo en un momento 🤍.";
  }
}
