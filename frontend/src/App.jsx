import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SalonOnboardingGate from "./components/SalonOnboardingGate";
import AppShell from "./components/AppShell";
import { Toaster } from "sonner";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AuthCallback from "./pages/auth/AuthCallback";
import Unauthorized from "./pages/Unauthorized";
import OnboardingSalon from "./pages/onboarding/OnboardingSalon";

import ClientHome from "./pages/client/ClientHome";
import Discover from "./pages/client/Discover";
import Vision from "./pages/client/Vision";
import PublicSalon from "./pages/PublicSalon";
import SalonOverview from "./pages/salon/SalonOverview";
import Services from "./pages/salon/Services";
import Products from "./pages/salon/Products";
import AdminOverview from "./pages/admin/AdminOverview";
import Placeholder from "./pages/Placeholder";
import RoomieChat from "./pages/chat/RoomieChat";

function FullScreenLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      data-testid="app-loading"
    >
      <div className="rm-glass-strong rounded-3xl px-8 py-6">
        <div className="w-8 h-8 rounded-full border-2 border-violet-200 border-t-magenta-500 animate-spin" />
      </div>
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();
  
  // Need to unwrap useAI and aiStudioOpen logic ONLY if it's placed inside a route that has Context, Wait, AppShell has useAI, we don't need it here.
  if (loading) return <FullScreenLoader />;

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <Routes>
        {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/discover/:slug" element={<PublicSalon />} />

      {/* Client workspace */}
      <Route
        path="/app"
        element={
          <ProtectedRoute allowedRoles={["client", "salon_owner", "admin"]}>
            <AppShell role="client" title="Roomie" />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientHome />} />
        <Route path="concierge" element={<RoomieChat />} />
        <Route path="discover" element={<Discover />} />
        <Route path="vision" element={<Vision />} />
        <Route
          path="bookings"
          element={
            <Placeholder
              titleKey="nav.bookings"
              descKey="client.subtitle"
              testId="client-bookings"
            />
          }
        />
        <Route
          path="profile"
          element={
            <Placeholder
              titleKey="nav.profile"
              descKey="client.subtitle"
              testId="client-profile"
            />
          }
        />
      </Route>

      {/* Salon onboarding (gates /salon access) */}
      <Route
        path="/onboarding/salon"
        element={
          <ProtectedRoute allowedRoles={["salon_owner"]}>
            <OnboardingSalon />
          </ProtectedRoute>
        }
      />

      {/* Salon workspace */}
      <Route
        path="/salon"
        element={
          <ProtectedRoute allowedRoles={["salon_owner", "admin"]}>
            <SalonOnboardingGate>
              <AppShell role="salon_owner" title="Workspace" />
            </SalonOnboardingGate>
          </ProtectedRoute>
        }
      >
        <Route index element={<SalonOverview />} />
        <Route path="concierge" element={<RoomieChat />} />
        <Route
          path="agenda"
          element={
            <Placeholder
              titleKey="nav.agenda"
              descKey="salon.workspace"
              testId="salon-agenda"
            />
          }
        />
        <Route
          path="clients"
          element={
            <Placeholder
              titleKey="nav.clients"
              descKey="salon.workspace"
              testId="salon-clients"
            />
          }
        />
        <Route path="services" element={<Services />} />
        <Route path="products" element={<Products />} />
        <Route
          path="team"
          element={
            <Placeholder
              titleKey="nav.team"
              descKey="salon.workspace"
              testId="salon-team"
            />
          }
        />
      </Route>

      {/* Admin panel */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AppShell role="admin" title="Admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route
          path="salons"
          element={
            <Placeholder
              titleKey="nav.salons"
              descKey="admin.panel"
              testId="admin-salons"
            />
          }
        />
        <Route
          path="users"
          element={
            <Placeholder
              titleKey="nav.users"
              descKey="admin.panel"
              testId="admin-users"
            />
          }
        />
        <Route
          path="health"
          element={
            <Placeholder
              titleKey="admin.platformHealth"
              descKey="admin.panel"
              testId="admin-health"
            />
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
