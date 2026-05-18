import React from 'react';
import { useAI } from '../context/AIContext';
import { AI_MODELS } from '../lib/ai/openrouter';
import { Bot, Zap, Sparkles, Paintbrush, DollarSign, X } from 'lucide-react';
import Modal from './Modal';

export default function AIStudioConfigurator() {
  const { activeModel, setModel, temperature, setTemperature, aiStudioOpen, setAiStudioOpen } = useAI();

  if (!aiStudioOpen) return null;

  const modelList = Object.values(AI_MODELS);

  const getIcon = (category) => {
    if (category.includes('Rápido')) return <Zap className="text-yellow-500" size={16} />;
    if (category.includes('Premium')) return <Sparkles className="text-magenta-500" size={16} />;
    if (category.includes('Creativo')) return <Paintbrush className="text-violet-500" size={16} />;
    return <DollarSign className="text-green-500" size={16} />;
  };

  return (
    <Modal
      open={aiStudioOpen}
      onClose={() => setAiStudioOpen(false)}
      title="Roomie Intelligence"
      subtitle="AI Studio Configurator (Demo Use Only)"
      size="md"
    >
      <div className="space-y-6 pb-2 border-b border-violet-100/30">
        <div className="bg-violet-50 dark:bg-gray-800 p-4 rounded-2xl">
          <h4 className="font-display font-bold text-violet-900 dark:text-white mb-2 flex items-center gap-2">
            <Bot size={18} className="text-magenta-500" />
            Model Registry
          </h4>
          <p className="text-sm text-violet-500 mb-4 leading-relaxed">
            Compara y cambia el modelo LLM subyacente de Roomie en tiempo real. Esto te permite evaluar velocidad frente a inteligencia contextual.
          </p>

          <div className="grid gap-3">
            {modelList.map((m) => {
              const isActive = activeModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between text-left p-3 rounded-xl border transition-all ${
                    isActive 
                    ? 'border-magenta-500 bg-white shadow-soft ring-1 ring-magenta-500/20' 
                    : 'border-violet-100/50 bg-white/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getIcon(m.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-violet-900">{m.name}</span>
                        {isActive && <span className="text-[10px] uppercase font-bold text-magenta-500 bg-magenta-50 px-1.5 rounded">Activo</span>}
                      </div>
                      <p className="text-xs text-violet-500 mt-1">{m.description}</p>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 flex gap-1">
                    {Array.from({length: 3}).map((_, i) => (
                       <DollarSign key={i} size={12} className={i < m.costLevel ? 'text-violet-400' : 'text-violet-100'} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-1">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-violet-900">Temperatura (Creatividad)</label>
            <span className="text-xs font-bold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">{temperature.toFixed(1)}</span>
          </div>
          <input 
            type="range" 
            min="0" max="1" step="0.1" 
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-magenta-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-violet-400 mt-1 uppercase tracking-widest font-bold">
            <span>Preciso</span>
            <span>Creativo</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
