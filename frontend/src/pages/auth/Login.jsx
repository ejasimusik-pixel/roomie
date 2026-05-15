import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Mail, Lock, AlertCircle, ArrowRight, Mail as MailHint } from "lucide-react";
import Logo from "../../components/Logo";
import { useAuth } from "../../context/AuthContext";
import { mapSupabaseError } from "../../lib/errors";

const GOOGLE_SVG = (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.58-5.05-3.71h-3v2.33A9 9 0 0 0 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.95 10.71A5.41 5.41 0 0 1 3.66 9c0-.6.1-1.18.29-1.71V4.96h-3A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.32 0 2.51.45 3.44 1.34l2.58-2.58A9 9 0 0 0 .96 4.96l3 2.33C4.66 5.16 6.65 3.58 9 3.58z"
    />
  </svg>
);

export default function Login() {
  const { t } = useTranslation();
  const { signIn, signInWithGoogle, isDemoBackend } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const [authError, setAuthError] = useState(null);

  const onSubmit = async ({ email, password }) => {
    setAuthError(null);
    const { data, error } = await signIn(email, password);
    if (error) {
      setAuthError(mapSupabaseError(error));
      return;
    }
    const role = data?.user?.user_metadata?.role || "client";
    const target =
      (typeof location.state?.from === "string" ? location.state.from : null) ||
      (role === "salon_owner"
        ? "/salon"
        : role === "admin"
        ? "/admin"
        : "/app");
    navigate(target, { replace: true });
  };

  const handleGoogle = async () => {
    setAuthError(null);
    const { error } = await signInWithGoogle();
    if (error) setAuthError(mapSupabaseError(error));
  };

  const hint = location.state?.hint;

  return (
    <div
      className="min-h-screen rm-bg-aurora flex items-center justify-center px-4 py-10"
      data-testid="login-page"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="rm-glass-strong rounded-[2rem] p-7 md:p-9 animate-scale-in">
          <h1 className="font-display font-extrabold text-3xl text-violet-900 tracking-tight">
            {t("auth.loginTitle")}
          </h1>
          <p className="mt-1.5 text-violet-500">
            {t("auth.loginSubtitle")}
          </p>

          {isDemoBackend && (
            <div
              className="mt-5 rounded-2xl bg-sky-400/10 border border-sky-400/30 p-3 text-xs text-sky-700"
              data-testid="demo-notice"
            >
              <p className="font-semibold">{t("auth.demoNotice")}</p>
              <p className="mt-1 opacity-80">
                {t("auth.demoCredentials")}:{" "}
                <code className="font-mono">cliente@roomie.demo</code> /{" "}
                <code className="font-mono">salon@roomie.demo</code> /{" "}
                <code className="font-mono">admin@roomie.demo</code> · pass:{" "}
                <code className="font-mono">Roomie2026!</code>
              </p>
            </div>
          )}

          {hint && (
            <div
              className="mt-5 flex items-start gap-2 rounded-2xl bg-sky-400/10 border border-sky-400/30 p-3 text-sm text-sky-700"
              data-testid="login-hint"
            >
              <MailHint size={16} className="flex-shrink-0 mt-0.5" />
              <p className="leading-snug">{hint}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 space-y-4"
            data-testid="login-form"
          >
            <div>
              <label htmlFor="email" className="rm-label">
                {t("auth.email")}
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  data-testid="login-email-input"
                  className="rm-input pl-11"
                  placeholder="hola@roomie.com"
                  {...register("email", { required: true })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-magenta-500">
                  {t("auth.email")} requerido
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="rm-label">
                {t("auth.password")}
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300"
                />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  data-testid="login-password-input"
                  className="rm-input pl-11"
                  placeholder="••••••••"
                  {...register("password", { required: true })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-violet-500 hover:text-magenta-500 transition-colors"
                data-testid="login-forgot-link"
              >
                {t("auth.forgot")}
              </Link>
            </div>

            {authError && (
              <div
                className="flex items-start gap-2 rounded-2xl bg-magenta-500/10 border border-magenta-500/20 p-3 text-sm text-magenta-600"
                data-testid="login-error"
              >
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p>{authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="login-submit-btn"
              className="rm-btn-primary w-full"
            >
              {isSubmitting ? t("auth.loading") : t("auth.signIn")}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="rm-divider flex-1" />
            <span className="text-xs uppercase tracking-widest text-violet-300 font-semibold">
              {t("auth.or")}
            </span>
            <div className="rm-divider flex-1" />
          </div>

          <button
            onClick={handleGoogle}
            data-testid="login-google-btn"
            className="rm-btn-ghost w-full"
          >
            {GOOGLE_SVG}
            <span>{t("auth.continueWithGoogle")}</span>
          </button>

          <p className="mt-7 text-center text-sm text-violet-500">
            {t("auth.noAccount")}{" "}
            <Link
              to="/signup"
              className="font-semibold rm-text-gradient"
              data-testid="login-to-signup-link"
            >
              {t("auth.createOne")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
