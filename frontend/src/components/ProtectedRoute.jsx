import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps protected pages. Optionally enforces one or more allowed roles.
 * `allowedRoles` accepts a string or an array. If omitted, any authenticated
 * user is allowed in.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-testid="protected-loading"
      >
        <div className="rm-glass rounded-3xl px-8 py-6 text-violet-700 font-medium">
          Cargando…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
  }

  if (allowedRoles) {
    const list = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!list.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}
