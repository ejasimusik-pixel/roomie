import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Receives the OAuth redirect from Supabase. The Supabase client picks up the
 * URL fragment automatically (detectSessionInUrl: true); we just wait for the
 * session to land in context and forward the user to the right dashboard.
 */
export default function AuthCallback() {
  const { isAuthenticated, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    const target =
      role === "salon_owner"
        ? "/salon"
        : role === "admin"
        ? "/admin"
        : "/app";
    navigate(target, { replace: true });
  }, [isAuthenticated, role, loading, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      data-testid="auth-callback-page"
    >
      <div className="rm-glass-strong rounded-3xl px-8 py-6 text-violet-700 font-semibold">
        Completando autenticación…
      </div>
    </div>
  );
}
