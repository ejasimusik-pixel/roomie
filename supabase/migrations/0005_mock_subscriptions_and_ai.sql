-- Migration 0005: Mock Subscriptions & Premium Tiers

-- Modificamos `salons` (Suscripciones de salón)
ALTER TABLE public.salons
ADD COLUMN plan_type text NOT NULL DEFAULT 'free',
ADD COLUMN plan_status text NOT NULL DEFAULT 'active',
ADD COLUMN plan_expires_at timestamptz;

ALTER TABLE public.salons
ADD CONSTRAINT valid_salon_plan_type CHECK (plan_type IN ('free', 'basic', 'standard', 'pro')),
ADD CONSTRAINT valid_salon_plan_status CHECK (plan_status IN ('active', 'past_due', 'canceled'));

-- Modificamos `client_profiles` (Suscripciones de clientas)
ALTER TABLE public.client_profiles
ADD COLUMN client_plan text NOT NULL DEFAULT 'free',
ADD COLUMN client_plan_status text NOT NULL DEFAULT 'active';

ALTER TABLE public.client_profiles
ADD CONSTRAINT valid_client_plan_type CHECK (client_plan IN ('free', 'premium')),
ADD CONSTRAINT valid_client_plan_status CHECK (client_plan_status IN ('active', 'past_due'));

-- Commenting constraints
COMMENT ON COLUMN public.salons.plan_type IS 'SaaS tier for the salon';
COMMENT ON COLUMN public.client_profiles.client_plan IS 'SaaS tier for the client profile';
