import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import Logo from "../components/Logo";

export default function Unauthorized() {
  const { t } = useTranslation();
  return (
    <div
      className="min-h-screen rm-bg-aurora flex items-center justify-center px-4"
      data-testid="unauthorized-page"
    >
      <div className="rm-glass-strong rounded-[2rem] p-10 max-w-md text-center animate-scale-in">
        <Logo size="md" />
        <div className="mt-6 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-magenta-500 to-violet-500 text-white flex items-center justify-center shadow-glow">
          <Lock size={26} />
        </div>
        <h1 className="mt-5 font-display font-extrabold text-2xl text-violet-900">
          {t("common.unauthorizedTitle")}
        </h1>
        <p className="mt-2 text-violet-500">{t("common.unauthorizedDesc")}</p>
        <Link to="/" className="rm-btn-primary mt-7 inline-flex">
          {t("common.goHome")}
        </Link>
      </div>
    </div>
  );
}
