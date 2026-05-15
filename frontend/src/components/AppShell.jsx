import { Outlet } from "react-router-dom";
import {
  Home,
  Sparkles,
  CalendarHeart,
  User,
  LayoutDashboard,
  CalendarRange,
  Users,
  Scissors,
  UserCog,
  ShieldCheck,
  Building2,
  Activity,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";

/**
 * AppShell — the single reusable layout for every authenticated experience.
 * It composes Sidebar (md+), TopBar (mobile) and BottomNav (mobile) and yields
 * the role-specific page through <Outlet />.
 *
 * The nav items it shows depend on the `role` prop, keeping the visual
 * structure identical across roles while their content varies.
 */
export default function AppShell({ role, title }) {
  const { t } = useTranslation();

  const clientItems = [
    { to: "/app", label: t("nav.home"), icon: Home },
    { to: "/app/discover", label: t("nav.discover"), icon: Sparkles },
    { to: "/app/bookings", label: t("nav.bookings"), icon: CalendarHeart },
    { to: "/app/profile", label: t("nav.profile"), icon: User },
  ];

  const salonItems = [
    { to: "/salon", label: t("nav.overview"), icon: LayoutDashboard },
    { to: "/salon/agenda", label: t("nav.agenda"), icon: CalendarRange },
    { to: "/salon/clients", label: t("nav.clients"), icon: Users },
    { to: "/salon/services", label: t("nav.services"), icon: Scissors },
    { to: "/salon/team", label: t("nav.team"), icon: UserCog },
  ];

  const adminItems = [
    { to: "/admin", label: t("nav.overview"), icon: ShieldCheck },
    { to: "/admin/salons", label: t("nav.salons"), icon: Building2 },
    { to: "/admin/users", label: t("nav.users"), icon: Users },
    { to: "/admin/health", label: t("admin.platformHealth"), icon: Activity },
  ];

  const items =
    role === "salon_owner"
      ? salonItems
      : role === "admin"
      ? adminItems
      : clientItems;

  return (
    <div className="min-h-screen pb-28 md:pb-0" data-testid={`shell-${role}`}>
      <Sidebar items={items} testId={`${role}-sidebar`} />
      <TopBar items={items} title={title} />

      <main className="md:pl-72">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 min-w-0">
          <Outlet />
        </div>
      </main>

      <BottomNav items={items} testId={`${role}-bottom-nav`} />
    </div>
  );
}
