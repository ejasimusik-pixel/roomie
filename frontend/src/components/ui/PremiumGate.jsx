import React, { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { Lock } from 'lucide-react';
import { PricingPlans } from '../PricingPlans';
import { useAuth } from '../../context/AuthContext';

export function PremiumGate({ featureId, children, fallbackUI }) {
  const { canAccess } = useSubscription();
  const { role } = useAuth();
  const [showPricing, setShowPricing] = useState(false);

  if (canAccess(featureId)) {
    return <>{children}</>;
  }

  if (fallbackUI) return <>{fallbackUI}</>;

  // Default elegant lock
  return (
    <div className="relative group rounded-[2rem] overflow-hidden shadow-sm h-full w-full">
      <div className="opacity-30 blur-[3px] pointer-events-none transition-all duration-300 h-full w-full">
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 rm-glass opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-md">
        <div className="bg-white dark:bg-gray-900 p-3 rounded-full shadow-pill mb-3 transform group-hover:scale-110 transition-transform duration-300">
          <Lock className="w-6 h-6 text-magenta-500" strokeWidth={2} />
        </div>
        <h4 className="font-display font-bold text-base text-violet-900 dark:text-white mb-1">Premium Feature</h4>
        <p className="text-xs text-violet-600 dark:text-violet-300 font-medium mb-3">Sube de nivel para acceder</p>
        <button 
          onClick={(e) => { e.preventDefault(); setShowPricing(true); }}
          className="rm-btn-primary px-5 py-2 text-xs font-bold rounded-xl shadow-glow opacity-90 hover:opacity-100"
        >
          Mejorar Plan ✨
        </button>
      </div>

      {showPricing && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl">
          <PricingPlans 
            type={role === 'client' ? 'client' : 'salon'}
            onClose={() => setShowPricing(false)} 
          />
        </div>
      )}
    </div>
  );
}
