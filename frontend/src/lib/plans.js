/**
 * ROOMIE PLANS & FEATURES CONFIG
 * Config-driven authorization and gating for Mock subscriptions
 */

export const SALON_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    limits: { services: 5, products: 5 },
    features: ['basic_profile', 'basic_whatsapp']
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 9,
    limits: { services: 20, products: 20 },
    features: ['basic_profile', 'basic_whatsapp', 'custom_colors']
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 19,
    limits: { services: Infinity, products: Infinity },
    features: ['basic_profile', 'basic_whatsapp', 'custom_colors', 'ai_logo_mock', 'analytics_lite']
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    limits: { services: Infinity, products: Infinity },
    features: ['basic_profile', 'basic_whatsapp', 'custom_colors', 'ai_logo_mock', 'analytics_lite', 'ai_product_extraction', 'roomie_suggests', 'fast_booking']
  }
};

export const CLIENT_PLANS = {
  free: {
    id: 'free',
    name: 'Base',
    price: 0,
    features: ['standard_booking', 'discover_access']
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    features: ['standard_booking', 'discover_access', 'roomie_vision', 'priority_booking']
  }
};

// Helper functions for easy gating
export function canSalonUseFeature(planId, featureId) {
  const plan = SALON_PLANS[planId] || SALON_PLANS.free;
  return plan.features.includes(featureId);
}

export function canClientUseFeature(planId, featureId) {
  const plan = CLIENT_PLANS[planId] || CLIENT_PLANS.free;
  return plan.features.includes(featureId);
}
