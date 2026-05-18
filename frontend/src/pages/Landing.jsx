import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Calendar,
  Gem,
  ArrowRight,
  Globe,
} from "lucide-react";
import Logo from "../components/Logo";
import GlassCard from "../components/GlassCard";
import InstallPWAButton from "../components/InstallPWAButton";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    role === "salon_owner"
      ? "/salon"
      : role === "admin"
      ? "/admin"
      : "/app";

  const toggleLang = () =>
    i18n.changeLanguage(i18n.language?.startsWith("es") ? "en" : "es");

  return (
    <div className="min-h-screen rm-bg-aurora" data-testid="landing-page">
      {/* Header */}
      <header className="px-4 md:px-8 pt-6">
        <div className="max-w-6xl mx-auto rm-glass-strong rounded-full px-4 md:px-6 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-violet-700">
            <a href="#features" className="hover:text-magenta-500 transition-colors">
              {t("landing.feature1Title")}
            </a>
            <a href="#how" className="hover:text-magenta-500 transition-colors">
              {t("landing.feature2Title")}
            </a>
            <a href="#salons" className="hover:text-magenta-500 transition-colors">
              {t("landing.feature3Title")}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              data-testid="landing-lang-toggle"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 text-violet-600 text-xs font-semibold hover:bg-white/90 transition-all"
              aria-label="Toggle language"
            >
              <Globe size={14} />
              {i18n.language?.startsWith("es") ? "EN" : "ES"}
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => navigate(dashboardPath)}
                data-testid="landing-go-app-btn"
                className="rm-btn-primary text-sm px-5 py-2"
              >
                {t("nav.home")}
                <ArrowRight size={14} />
              </button>
            ) : (
              <Link
                to="/login"
                data-testid="landing-login-btn"
                className="rm-btn-ghost text-sm px-5 py-2"
              >
                {t("auth.signIn")}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 md:px-8 pt-12 md:pt-24 pb-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="animate-slide-up">
            <span
              className="rm-chip mb-5"
              data-testid="landing-eyebrow"
            >
              <Sparkles size={12} className="text-magenta-500" />
              {t("landing.eyebrow")}
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-violet-900">
              {t("landing.headline")}
              <br />
              <span className="rm-text-gradient">
                {t("landing.headlineAccent")}
              </span>
            </h1>
            <p className="mt-6 text-lg text-violet-500 leading-relaxed max-w-xl">
              {t("landing.subhead")}
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link
                to="/signup"
                data-testid="landing-cta-primary"
                className="rm-btn-primary"
              >
                {t("landing.ctaPrimary")}
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/signup?role=salon_owner"
                data-testid="landing-cta-secondary"
                className="rm-btn-ghost"
              >
                {t("landing.ctaSecondary")}
              </Link>
              <InstallPWAButton variant="ghost" />
            </div>

            <div className="mt-10 flex items-center gap-5">
              <div className="flex -space-x-3">
                {[
                  "from-sky-400 to-violet-500",
                  "from-violet-500 to-magenta-500",
                  "from-magenta-500 to-pink-300",
                ].map((g, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br ${g}`}
                  />
                ))}
              </div>
              <p className="text-sm text-violet-500 leading-tight">
                <span className="text-violet-900 font-semibold">+1.200</span>{" "}
                clientas premium
                <br />
                ya cuidan su rutina con Roomie
              </p>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div
              className="absolute inset-0 -z-10 rm-glass rounded-[2.5rem]"
              aria-hidden
            />
            <img
              src="/icons/logo-roomie.jpg"
              alt="Roomie hero"
              className="rounded-[2rem] w-full max-w-md mx-auto animate-float shadow-glow"
              data-testid="landing-hero-image"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 md:px-8 pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Sparkles,
              title: t("landing.feature1Title"),
              desc: t("landing.feature1Desc"),
              gradient: "from-magenta-500 to-pink-300",
            },
            {
              icon: Calendar,
              title: t("landing.feature2Title"),
              desc: t("landing.feature2Desc"),
              gradient: "from-violet-500 to-sky-400",
            },
            {
              icon: Gem,
              title: t("landing.feature3Title"),
              desc: t("landing.feature3Desc"),
              gradient: "from-sky-400 to-violet-500",
            },
          ].map((f, i) => (
            <GlassCard key={i} testId={`landing-feature-${i}`}>
              <span
                className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl text-white shadow-pill mb-5 bg-gradient-to-br ${f.gradient}`}
              >
                <f.icon size={22} />
              </span>
              <h3 className="text-xl font-bold text-violet-900">{f.title}</h3>
              <p className="mt-2 text-violet-500 leading-relaxed">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <footer className="px-4 md:px-8 pb-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-center justify-between gap-3 text-sm text-violet-400 text-center md:text-left">
          <Logo size="sm" />
          <p className="leading-snug">© {new Date().getFullYear()} Roomie. {t("landing.footer")}</p>
        </div>
      </footer>
    </div>
  );
}
