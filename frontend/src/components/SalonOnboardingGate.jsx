import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Forwards a salon_owner who has not yet been attached to a salon to the
 * onboarding flow. All other roles pass through.
 *
 * Wrap this around the salon workspace shell so the only path into `/salon/*`
 * for a brand-new owner is through `/onboarding/salon`.
 */
export default function SalonOnboardingGate({ children }) {
  const { role, salonId, loading } = useAuth();
  if (loading) return null;
  if (role === "salon_owner" && !salonId) {
    return <Navigate to="/onboarding/salon" replace />;
  }
  return children;
}
