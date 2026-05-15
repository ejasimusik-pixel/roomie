import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Mail, Lock, User, AlertCircle, ArrowRight } from "lucide-react";
import Logo from "../../components/Logo";
import { useAuth } from "../../context/AuthContext";

export default function Signup() {
  const { t } = useTranslation();
  const { signUp, isDemoBackend } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const defaultRole = search.get("role") === "salon_owner" ? "salon_owner" : "client";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({ defaultValues: { role: defaultRole } });
  const [authError, setAuthError] = useState(null);

  const selectedRole = watch("role");

  const onSubmit = async ({ email, password, fullName, role }) => {
    setAuthError(null);
    const metadata = {
      full_name: fullName,
      role,
      salon_id: role === "salon_owner" ? `salon-${Math.random().toString(36).slice(2, 9)}` : null,
    };
    const { data, error } = await signUp(email, password, metadata);
    if (error) {
      setAuthError(error.message);
      return;
    }
    if (data?.session) {
      const target =
        role === "salon_owner" ? "/salon" : role === "admin" ? "/admin" : "/app";
      navigate(target, { replace: true });
    } else {
      navigate("/auth/check-email", { state: { email } });
    }
  };

  const roleOptions = [
    { value: "client", label: t("auth.roleClient") },
    { value: "salon_owner", label: t("auth.roleSalonOwner") },
  ];

  return (
    <div
      className="min-h-screen rm-bg-aurora flex items-center justify-center px-4 py-10"
      data-testid="signup-page"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="rm-glass-strong rounded-[2rem] p-7 md:p-9 animate-scale-in">
          <h1 className="font-display font-extrabold text-3xl text-violet-900 tracking-tight">
            {t("auth.signupTitle")}
          </h1>
          <p className="mt-1.5 text-violet-500">
            {t("auth.signupSubtitle")}
          </p>

          {isDemoBackend && (
            <div className="mt-5 rounded-2xl bg-sky-400/10 border border-sky-400/30 p-3 text-xs text-sky-700">
              <p className="font-semibold">{t("auth.demoNotice")}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 space-y-4"
            data-testid="signup-form"
          >
            <div>
              <label className="rm-label">{t("auth.role")}</label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((opt) => (
                  <label
                    key={opt.value}
                    data-testid={`signup-role-${opt.value}`}
                    className={`cursor-pointer rounded-2xl px-4 py-3 text-sm font-semibold text-center transition-all border ${
                      selectedRole === opt.value
                        ? "bg-gradient-to-br from-magenta-500/15 to-violet-500/15 border-magenta-500/40 text-violet-900 shadow-soft"
                        : "bg-white/50 border-violet-100 text-violet-500 hover:bg-white/80"
                    }`}
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      className="sr-only"
                      {...register("role", { required: true })}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="rm-label">
                {t("auth.fullName")}
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300"
                />
                <input
                  id="fullName"
                  data-testid="signup-name-input"
                  className="rm-input pl-11"
                  placeholder="Sofía Martínez"
                  {...register("fullName", { required: true, minLength: 2 })}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-magenta-500">
                  {t("auth.fullName")} requerido
                </p>
              )}
            </div>

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
                  data-testid="signup-email-input"
                  className="rm-input pl-11"
                  placeholder="hola@roomie.com"
                  {...register("email", { required: true })}
                />
              </div>
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
                  autoComplete="new-password"
                  data-testid="signup-password-input"
                  className="rm-input pl-11"
                  placeholder="Mínimo 8 caracteres"
                  {...register("password", { required: true, minLength: 8 })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-magenta-500">
                  Mínimo 8 caracteres
                </p>
              )}
            </div>

            {authError && (
              <div
                className="flex items-start gap-2 rounded-2xl bg-magenta-500/10 border border-magenta-500/20 p-3 text-sm text-magenta-600"
                data-testid="signup-error"
              >
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p>{authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="signup-submit-btn"
              className="rm-btn-primary w-full"
            >
              {isSubmitting ? t("auth.loading") : t("auth.signUp")}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>

            <p className="text-[11px] text-center text-violet-400 leading-relaxed">
              {t("auth.agreeTerms")}
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-violet-500">
            {t("auth.haveAccount")}{" "}
            <Link
              to="/login"
              className="font-semibold rm-text-gradient"
              data-testid="signup-to-login-link"
            >
              {t("auth.logIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
