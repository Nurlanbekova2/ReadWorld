import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { FiShield, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit({ email, password }) {
    setLoading(true);
    try {
      const { profile } = await login(email, password);
      if (!profile || profile.role !== "admin") {
        await signOut(auth);
        toast.error(t.auth.accessDenied);
        return;
      }
      toast.success(t.auth.welcomeAdmin);
      navigate("/admin");
    } catch (err) {
      toast.error(err.message || t.auth.errors.loginFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-2xl mb-4">
            <FiShield className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">{t.auth.adminPanel}</h1>
          <p className="text-sm text-gray-400 mt-1">{t.auth.adminDesc}</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">{t.auth.email}</label>
              <input type="email" placeholder="admin@readworld.com"
                className={`w-full px-4 py-3 rounded-xl border ${errors.email ? "border-red-500" : "border-gray-600"} bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
                {...register("email", { required: t.auth.errors.emailRequired })}
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">{t.auth.password}</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} placeholder={t.auth.adminPasswordPlaceholder}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border ${errors.password ? "border-red-500" : "border-gray-600"} bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
                  {...register("password", { required: t.auth.errors.passwordRequired })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition shadow-lg disabled:opacity-60 text-sm">
              {loading ? t.auth.authenticating : t.auth.signInToAdmin}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}