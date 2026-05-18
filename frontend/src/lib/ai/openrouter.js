/**
 * Roomie - OpenRouter Core Abstraction
 * Handles interaction with OpenRouter AI for Dual Persona capabilities.
 */

// Model Registry
export const AI_MODELS = {
  FAST: {
    id: "google/gemini-flash-1.5",
    name: "Gemini Flash 1.5",
    category: "Rápido ⚡",
    description: "Ideal para conversaciones rápidas y dinámicas.",
    costLevel: 1
  },
  PREMIUM: {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    category: "Premium ✨",
    description: "Equilibrio perfecto entre velocidad y alta calidad emocional.",
    costLevel: 2
  },
  CREATIVE: {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    category: "Creativo 🎨",
    description: "Máxima inteligencia. Ideal para copywriting y estrategias de salón.",
    costLevel: 3
  },
  ECONOMIC: {
    id: "meta-llama/llama-3-8b-instruct:free",
    name: "Llama 3 (Free)",
    category: "Económico 💸",
    description: "Testeo rápido sin costo de API.",
    costLevel: 0
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
