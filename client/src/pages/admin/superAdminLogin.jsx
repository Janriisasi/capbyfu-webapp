import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";

// ─── Access key from environment variables (client-side safe) ────────────────
const SECRET_KEY = import.meta.env.VITE_ADMIN_ACCESS_KEY;
// Access via: /admin?access_key=... (Check .env for key)
// Anyone hitting /admin without the key sees a fake 404

// ─── Fake 404 page ────────────────────────────────────────────────────────────
const Fake404 = () => (
  <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0A1614] font-sans select-none overflow-hidden">
    {/* Background blobs to match theme */}
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#0d59f2]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#C5C5C5]/10 rounded-full blur-3xl" />
    </div>

    <div className="relative z-10 text-center max-w-md px-6">
      {/* Logo */}
      <img
        src="/assets/logo.png"
        alt="CapBYFU Logo"
        className="h-16 object-contain mx-auto mb-8 opacity-90"
      />

      {/* 404 Mimic */}
      <h1 className="text-8xl font-black text-white mb-4 tracking-tighter">
        404
      </h1>
      <div className="w-12 h-1 bg-[#326f61] mx-auto mb-6 rounded-full" />
      <p className="text-slate-300 text-sm font-medium mb-1">
        This page could not be found.
      </p>
      <p className="text-slate-500 text-xs">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        className="inline-block mt-10 text-xs font-semibold text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
      >
        ← Back to Home
      </a>
    </div>
  </div>
);

// ─── Real login form ──────────────────────────────────────────────────────────
const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSuperAdmin, loading, superAdmin } = useAuth();
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Preserve the access_key in redirects so auth still works after login
  const keyParam = new URLSearchParams(location.search).get("access_key");

  React.useEffect(() => {
    if (superAdmin) navigate("/admin/dashboard");
  }, [superAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error("Enter admin password");
      return;
    }
    const result = await loginSuperAdmin(password);
    if (result.success) {
      toast.success("Welcome, CapBYFU Admin!");
      navigate("/admin/dashboard");
    } else {
      toast.error("Invalid admin password");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-[#0A1614]">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#0d59f2]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#C5C5C5]/10 rounded-full blur-3xl" />
      </div>

      {/* Top Left Back Button */}
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-50 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#C5C5C5]/40 hover:text-[#C5C5C5] transition-colors group px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm"
      >
        <svg className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-sm md:max-w-md bg-[#F1F1F1] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-white/50 border-b border-slate-200 px-6 py-6 text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 bg-[#0A1614] rounded-full text-white mb-4">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h1 className="text-lg md:text-xl font-black text-[#0A1614] tracking-tight mb-1">
            CapBYFU Admin Portal
          </h1>
          <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
            Restricted access. Authorized personnel only.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 md:p-7 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-0.5">
              Admin Password
            </label>
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#0A1614] focus:border-[#0A1614] transition-all outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0A1614] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  {showPass ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A1614] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <>
                  Access Dashboard
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <img
          src="/assets/logo.png"
          alt="CapBYFU Logo"
          className="h-12 object-contain opacity-100"
        />
      </div>
    </div>
  );
};

// ─── Main export — checks URL param, shows 404 or real login ─────────────────
const SuperAdminLogin = () => {
  const location = useLocation();
  const key = new URLSearchParams(location.search).get("access_key");
  return key === SECRET_KEY ? <LoginForm /> : <Fake404 />;
};

export default SuperAdminLogin;
