import { useAuth } from '../context/AuthContext';
import { canSalonUseFeature, canClientUseFeature } from '../lib/plans';

export function useSubscription() {
  const { role, salonPlan, clientPlan } = useAuth();
  
  const canAccess = (featureId) => {
    if (role === 'admin') return true;
    if (role === 'salon_owner') return canSalonUseFeature(salonPlan, featureId);
    return canClientUseFeature(clientPlan, featureId);
  };

  const getPlanInfo = () => {
    return {
      salonPlan,
      clientPlan,
      isPremiumSalon: salonPlan !== 'free' && salonPlan !== 'basic',
      isPremiumClient: clientPlan === 'premium'
    };
  };

  return { canAccess, getPlanInfo };
}
