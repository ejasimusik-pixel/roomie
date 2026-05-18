import React from 'react';
import { useAI } from '../context/AIContext';
import { AI_MODELS } from '../lib/ai/openrouter';
import { Bot, Check, Sparkles } from 'lucide-react';
import Modal from './Modal';

/**
 * AI Studio — premium model selector for Roomie Concierge.
 * Visualizes 4 OpenRouter models with speed / quality / cost meters.
 * Selection is persisted via AIContext (localStorage).
 */
function Meter({ label, value, accent = 'bg-violet-500' }) {
  return (
    <div className="flex items-center gap-2" data-testid={`ai-meter-${label.toLowerCase()}`}>
      <span className="text-[10px] uppercase tracking-widest font-bold text-violet-400 w-14">
        {label}
      </span>
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 w-5 rounded-full transition-colors ${
              i <= value ? accent : 'bg-violet-100'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AIStudioConfigurator() {
  const {
    activeModel,
    setModel,
    temperature,
    setTemperature,
    aiStudioOpen,
    setAiStudioOpen,
  } = useAI();

  if (!aiStudioOpen) return null;

  const modelList = Object.values(AI_MODELS);

  return (
    <Modal
      open={aiStudioOpen}
      onClose={() => setAiStudioOpen(false)}
      title="AI Studio"
      subtitle="Elige cómo piensa tu Roomie"
      size="md"
    >
      <div className="space-y-5 pb-1" data-testid="ai-studio-modal">
        {/* Intro line */}
        <div className="flex items-center gap-2 text-xs text-violet-500 leading-relaxed">
          <Sparkles size={14} className="text-magenta-500 flex-shrink-0" />
          <span>
            Cuatro inteligencias verificadas. Cambia en cualquier momento — la
            elección se guarda automáticamente.
          </span>
        </div>

        {/* Model grid */}
        <div className="grid gap-3" data-testid="ai-models-grid">
          {modelList.map((m) => {
            const isActive = activeModel === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                data-testid={`ai-model-card-${m.label.toLowerCase()}`}
                className={`group relative overflow-hidden text-left p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-magenta-400 bg-white shadow-[0_8px_30px_rgba(200,60,180,0.10)] ring-1 ring-magenta-400/30'
                    : 'border-violet-100/60 bg-white/50 hover:bg-white hover:border-violet-200 hover:shadow-soft'
                }`}
              >
                {/* Soft accent corner */}
                <div
                  className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${m.accent} opacity-50 pointer-events-none`}
                />

                <div className="relative flex items-start gap-3">
                  <span
                    className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white shadow-sm ring-1 ring-violet-100 text-lg ${m.iconColor}`}
                  >
                    {m.badge}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-violet-900">
                        {m.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400">
                        {m.label}
                      </span>
                      {isActive && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-white bg-gradient-to-r from-magenta-500 to-violet-500 px-2 py-0.5 rounded-full shadow-sm"
                          data-testid="ai-active-badge"
                        >
                          <Check size={10} strokeWidth={3} /> Activo
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-violet-500 mt-1.5 leading-relaxed">
                      {m.tagline}
                    </p>

                    {/* Meters */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      <Meter
                        label="Veloc."
                        value={m.speed}
                        accent="bg-amber-400"
                      />
                      <Meter
                        label="Calidad"
                        value={m.quality}
                        accent="bg-magenta-500"
                      />
                      <Meter
                        label="Costo"
                        value={m.costLevel}
                        accent="bg-violet-400"
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Temperature */}
        <div className="bg-violet-50/60 rounded-2xl p-4 border border-violet-100/50">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-violet-900">
              Temperatura
            </label>
            <span
              className="text-xs font-bold bg-white text-magenta-500 px-2.5 py-0.5 rounded-full shadow-sm"
              data-testid="ai-temperature-value"
            >
              {temperature.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-magenta-500 cursor-pointer"
            data-testid="ai-temperature-slider"
          />
          <div className="flex justify-between text-[10px] text-violet-400 mt-1 uppercase tracking-widest font-bold">
            <span>Preciso</span>
            <span>Creativo</span>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-[11px] text-violet-400 text-center leading-relaxed flex items-center justify-center gap-1.5">
          <Bot size={12} className="text-violet-300" />
          Tu Roomie usa estos modelos sin que lo notes. Tú solo siente la magia.
        </p>
      </div>
    </Modal>
  );
}
