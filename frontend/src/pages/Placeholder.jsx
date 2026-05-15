import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";

export default function Placeholder({ titleKey, descKey, testId }) {
  const { t } = useTranslation();
  return (
    <div
      className="space-y-6 animate-fade-in min-h-[60vh] flex flex-col"
      data-testid={testId}
    >
      <header>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-violet-900 tracking-tight">
          {t(titleKey)}
        </h1>
        {descKey && (
          <p className="mt-1.5 text-violet-500">{t(descKey)}</p>
        )}
      </header>

      <GlassCard className="flex-1 flex flex-col items-center justify-center text-center" hoverable={false}>
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-400 via-violet-500 to-magenta-500 mb-4 shadow-glow animate-float" />
        <h2 className="font-display font-bold text-xl text-violet-900">
          {t("client.comingSoon")}
        </h2>
        <p className="mt-2 text-violet-500 max-w-sm">
          Esta sección será parte de la próxima fase de Roomie.
        </p>
      </GlassCard>
    </div>
  );
}
