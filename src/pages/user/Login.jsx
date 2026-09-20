import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import { FiBook, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, loginWithGoogle } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit({ email, password }) {
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t.auth.welcomeBackMsg);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || t.auth.errors.loginFailed);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success(t.auth.welcomeBackMsg);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || t.auth.errors.googleFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white dark:from-dark-bg dark:to-dark-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg mb-3">
            <FiBook className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t.auth.welcomeBack}</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">{t.auth.signInDesc}</p>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">{t.auth.email}</label>
              <input type="email" placeholder={t.auth.emailPlaceholder}
                className={`w-full px-4 py-3 rounded-xl border ${errors.email ? "border-red-400" : "border-gray-200 dark:border-dark-border"} bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400 transition text-sm`}
                {...register("email", { required: t.auth.errors.emailRequired })}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">{t.auth.password}</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} placeholder={t.auth.passwordPlaceholder}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border ${errors.password ? "border-red-400" : "border-gray-200 dark:border-dark-border"} bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400 transition text-sm`}
                  {...register("password", { required: t.auth.errors.passwordRequired })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition shadow-md disabled:opacity-60 text-sm">
              {loading ? t.auth.signingIn : t.auth.signIn}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-dark-border" /></div>
            <div className="relative flex justify-center"><span className="bg-white dark:bg-dark-surface px-3 text-xs text-gray-400">{t.auth.orContinueWith}</span></div>
          </div>

          <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg transition text-sm font-medium text-gray-700 dark:text-dark-text disabled:opacity-60">
            <FcGoogle size={20} />
            {t.auth.continueWithGoogle}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-dark-muted mt-5">
          {t.auth.noAccount}{" "}
          <Link to="/register" className="text-primary-600 hover:underline font-medium">{t.auth.signUpFree}</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          <Link to="/admin/login" className="text-primary-500 hover:underline">{t.auth.adminLogin} →</Link>
        </p>
      </div>
    </div>
  );
}