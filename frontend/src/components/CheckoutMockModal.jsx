import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function CheckoutMockModal({ plan, isClient, onClose, onSuccess }) {
  const { profile, applyLocalProfile, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState('');

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (card.length < 15) {
      toast.error('Tarjeta inválida. (Usa 4242 para la demo)');
      return;
    }

    setLoading(true);
    // Fake native spinner & delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Optimistic update
      if (isClient) {
        applyLocalProfile({ 
          client_profile: { ...(profile?.client_profile || {}), client_plan: plan.id } 
        });
        // Real implementation: await supabase.from('client_profiles').update({ client_plan: plan.id }).eq('profile_id', session.user.id);
      } else {
        applyLocalProfile({ 
          salon: { ...(profile?.salon || {}), plan_type: plan.id } 
        });
        // Real implementation: await supabase.from('salons').update({ plan_type: plan.id }).eq('id', profile.salon_id);
      }
      
      toast.success(`✨ ¡Bienvenido al plan ${plan.name}!`);
      onSuccess();
    } catch (err) {
      toast.error('Hubo un error en el upgrade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={loading ? null : onClose} />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-glow w-full max-w-md overflow-hidden animate-scale-in">
        <div className="h-24 bg-gradient-to-br from-magenta-500 to-violet-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          <Zap className="absolute -right-4 -top-4 w-24 h-24 text-white/20" />
        </div>
        
        <div className="p-8 -mt-12 relative z-10">
          <div className="bg-white dark:bg-gray-800 w-20 h-20 rounded-2xl shadow-pill flex items-center justify-center mb-6 mx-auto">
            <span className="text-3xl font-black text-violet-900 dark:text-white">${plan.price}</span>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-display font-bold text-violet-900 dark:text-white">Actualizar a {plan.name}</h3>
            <p className="text-violet-500 text-sm font-medium mt-1">Suscripción mensual, cancela cuando quieras.</p>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-violet-900 dark:text-violet-300 mb-2 uppercase tracking-wide">
                Tarjeta de Pago Sensible
              </label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="4242 4242 4242 4242"
                  value={card}
                  onChange={(e) => setCard(e.target.value.replace(/\D/g, '').substring(0, 16))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 focus:ring-2 focus:ring-magenta-500 rounded-2xl dark:bg-gray-800 dark:text-white transition-shadow"
                  disabled={loading}
                />
              </div>
              <div className="flex items-center gap-1 mt-2 justify-center text-xs text-gray-500">
                <ShieldCheck className="w-3 h-3 text-green-500" /> Transacción segura simulada
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                loading ? 'bg-violet-400 cursor-wait' : 'rm-btn-primary shadow-glow'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando magia...
                </>
              ) : (
                `Suscribirse por $${plan.price}`
              )}
            </button>
          </form>

          {!loading && (
            <button type="button" onClick={onClose} className="w-full mt-4 py-2 text-sm text-gray-500 font-medium hover:text-violet-700 transition-colors">
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
