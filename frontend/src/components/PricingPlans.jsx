import React, { useState } from 'react';
import { SALON_PLANS, CLIENT_PLANS } from '../lib/plans';
import { Check, Sparkles, X } from 'lucide-react';
import { CheckoutMockModal } from './CheckoutMockModal';
import { useAuth } from '../context/AuthContext';

export function PricingPlans({ type = 'salon', onClose }) {
  const { role, salonPlan, clientPlan } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const isClient = type === 'client';
  const plansObj = isClient ? CLIENT_PLANS : SALON_PLANS;
  const currentPlanId = isClient ? clientPlan : salonPlan;

  const handleSelect = (plan) => {
    setSelectedPlan(plan);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 relative">
      {onClose && (
        <button onClick={onClose} className="absolute right-4 top-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      )}
      
      <div className="text-center mb-10 px-4">
        <h2 className="text-3xl md:text-4xl font-display font-black text-violet-900 dark:text-white mb-4">
          Eleva tu {isClient ? 'Experiencia' : 'Salón'} al Siguiente Nivel
        </h2>
        <p className="text-violet-500 font-medium max-w-xl mx-auto">
          Elige el plan que mejor se adapte a ti. {isClient ? 'Disfruta de prioridad y funciones mágicas.' : 'Digitaliza tu inventario e impulsa tus ventas con IA.'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {Object.values(plansObj).map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const isPro = plan.id === 'pro' || plan.id === 'premium';
          
          return (
            <div key={plan.id} className={`relative flex flex-col p-6 rounded-[2rem] transition-all duration-300 ${isPro ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-magenta-500/30 lg:scale-105 shadow-glow z-10' : 'bg-white dark:bg-gray-800 shadow-soft'}`}>
              {isPro && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-gradient-to-r from-magenta-500 to-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-pill flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Recomendado
                  </span>
                </div>
              )}
              
              <h3 className="text-xl font-bold font-display text-violet-900 dark:text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-violet-900 dark:text-white">${plan.price}</span>
                <span className="text-violet-500 font-medium">/mes</span>
              </div>
              
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map(feat => (
                  <li key={feat} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-5 h-5 text-magenta-500 shrink-0" />
                    <span className="capitalize">{feat.replace(/_/g, ' ')}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => !isCurrent && handleSelect(plan)}
                disabled={isCurrent}
                className={`w-full py-3 rounded-2xl font-bold transition-all ${
                  isCurrent 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700' 
                  : isPro 
                    ? 'rm-btn-primary shadow-glow text-white' 
                    : 'bg-violet-100 text-violet-900 hover:bg-violet-200 dark:bg-gray-700 dark:text-white'
                }`}
              >
                {isCurrent ? 'Plan Actual' : 'Seleccionar Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {selectedPlan && (
        <CheckoutMockModal 
          plan={selectedPlan} 
          isClient={isClient}
          onClose={() => setSelectedPlan(null)} 
          onSuccess={() => {
            setSelectedPlan(null);
            if (onClose) onClose();
          }}
        />
      )}
    </div>
  );
}
