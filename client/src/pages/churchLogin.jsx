import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import { CHURCHES } from "../lib/constants";

// ── Custom Church Dropdown ──────────────────────────────────────────────────
const ChurchDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);

  const circuitA = CHURCHES.filter((c) => c.circuit === "A");
  const circuitB = CHURCHES.filter((c) => c.circuit === "B");
  const circuitC = CHURCHES.filter((c) => c.circuit === "C");

  const filter = (list) =>
    list.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when opening
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const select = (name) => {
    onChange(name);
    setOpen(false);
    setSearch("");
  };

  const groups = [
    { label: "Circuit A", items: filter(circuitA) },
    { label: "Circuit B", items: filter(circuitB) },
    { label: "Circuit C", items: filter(circuitC) },
  ].filter((g) => g.items.length > 0);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 pl-3.5 pr-3 py-2.5 bg-white border rounded-xl text-sm transition-all text-left ${
          open
            ? "border-[#0A1614] ring-2 ring-[#0A1614]/10"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <svg
          className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <span
          className={`flex-1 truncate ${value ? "text-slate-800 font-medium" : "text-slate-400"}`}
        >
          {value || "Search or select your church…"}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{ transformOrigin: "top" }}
            className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Search inside dropdown */}
            <div className="p-2 border-b border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                <svg
                  className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type to filter churches…"
                  className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-52 overflow-y-auto py-1">
              {groups.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No churches found
                </p>
              ) : (
                groups.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {group.label}
                    </p>
                    {group.items.map((church) => (
                      <button
                        key={church.id}
                        type="button"
                        onClick={() => select(church.name)}
                        className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 ${
                          value === church.name
                            ? "bg-[#0A1614] text-white"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {value === church.name && (
                          <svg
                            className="w-3 h-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        )}
                        <span className={value === church.name ? "" : "pl-5"}>
                          {church.name}
                        </span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Forgot Password Modal (Visiting Churches Only) ──────────────────────────
const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1: enter name, 2: new password
  const [churchName, setChurchName] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerifyChurch = async (e) => {
    e.preventDefault();
    if (!churchName.trim()) {
      toast.error("Please enter your visiting church name");
      return;
    }
    setLoading(true);
    try {
      const { supabase } = await import("../lib/supabase");
      const { data, error } = await supabase
        .from("churches")
        .select("id, name, circuit, approval_status")
        .eq("name", churchName.trim())
        .eq("circuit", "Visiting")
        .single();

      if (error || !data) {
        toast.error("Visiting church not found. Please check the name and try again.");
        setLoading(false);
        return;
      }

      if (data.approval_status === "declined") {
        toast.error("Your church access has been declined. Please contact a CapBYFU officer.");
        setLoading(false);
        return;
      }

      setStep(2);
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { supabase } = await import("../lib/supabase");
      // Use the RPC to reset the password — same as re-registering with new password
      const { data, error } = await supabase.rpc(
        "reset_visiting_church_password",
        {
          p_name: churchName.trim(),
          p_new_password: newPass,
        },
      );

      if (error) throw error;

      if (data && data.success === false) {
        toast.error(data.error || "Failed to reset password.");
        return;
      }

      toast.success("Password reset successfully! You can now log in with your new password.", { duration: 5000 });
      onClose();
    } catch (err) {
      // Fallback: if RPC doesn't exist, show a guidance message
      toast.error("Password reset requires admin support. Please contact a CapBYFU officer to reset your password.", { duration: 7000 });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010101]/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F1F1F1] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="bg-white/60 border-b border-slate-200 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0A1614] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-[#0A1614] text-sm leading-none">Forgot Password</h3>
              <p className="text-slate-400 text-xs mt-0.5">Visiting Churches Only</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-[#0A1614] transition-colors p-1 hover:bg-slate-100 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleVerifyChurch} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <p className="text-[11px] text-blue-600 leading-relaxed">
                  Enter your visiting church name exactly as you registered it. We'll verify your church and allow you to set a new password.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Your Visiting Church Name
                </label>
                <input
                  type="text"
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  placeholder="e.g. Romblon Baptist Church"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#0A1614] focus:border-[#0A1614] transition-all outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0A1614] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
              >
                {loading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    Verify Church
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <p className="text-[11px] text-green-700 leading-relaxed">
                  ✓ Church found: <span className="font-bold">{churchName}</span>. Set your new password below.
                </p>
              </div>
              {/* New password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  New Password
                </label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#0A1614] focus:border-[#0A1614] transition-all outline-none"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0A1614] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      {showNewPass ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Confirm New Password
                </label>
                <input
                  type={showNewPass ? "text" : "password"}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#0A1614] focus:border-[#0A1614] transition-all outline-none ${
                    confirmPass && newPass !== confirmPass ? "border-red-300" : "border-slate-200"
                  }`}
                  required
                />
                {confirmPass && newPass !== confirmPass && (
                  <p className="text-[11px] text-red-500">Passwords do not match</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setNewPass(""); setConfirmPass(""); }}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || (confirmPass && newPass !== confirmPass)}
                  className="flex-1 bg-[#0A1614] text-white font-bold py-2.5 rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
                >
                  {loading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : "Reset Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ── Main Login Component ────────────────────────────────────────────────────
const ChurchLogin = () => {
  const navigate = useNavigate();
  const { loginChurchAdmin, loading } = useAuth();

  // Tab: "member" | "visiting"
  const [tab, setTab] = useState("member");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Member church login
  const [selectedChurch, setSelectedChurch] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Visiting church
  const [visitName, setVisitName] = useState("");
  const [visitPass, setVisitPass] = useState("");
  const [visitPassConfirm, setVisitPassConfirm] = useState("");
  const [showVisitPass, setShowVisitPass] = useState(false);
  const [visitLoading, setVisitLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChurch) {
      toast.error("Please select your church");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    const result = await loginChurchAdmin(selectedChurch, password);
    if (result.success) {
      toast.success("Access granted! Welcome.");
      navigate("/register/dashboard");
    } else {
      toast.error(result.error || "Invalid credentials");
    }
  };

  const handleVisitingSubmit = async (e) => {
    e.preventDefault();
    if (!visitName.trim()) {
      toast.error("Please enter your church name");
      return;
    }
    if (visitPass.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (visitPass !== visitPassConfirm) {
      toast.error("Passwords do not match");
      return;
    }

    setVisitLoading(true);
    try {
      const { supabase } = await import("../lib/supabase");

      // Single RPC call — handles create or verify atomically, bypasses RLS
      const { data, error } = await supabase.rpc(
        "register_or_login_visiting_church",
        {
          p_name: visitName.trim(),
          p_password: visitPass,
        },
      );

      if (error) throw error;

      if (!data.success) {
        toast.error(data.error || "Failed to register.");
        setVisitLoading(false);
        return;
      }

      // ── Check approval status ────────────────────────────────────────────
      const { data: churchData } = await supabase
        .from("churches")
        .select("approval_status")
        .eq("name", visitName.trim())
        .single();

      const approvalStatus = churchData?.approval_status || "pending";

      if (approvalStatus === "declined") {
        toast.error(
          "Your access has been declined by the admin. Please contact a CapBYFU officer for assistance.",
          { duration: 6000 },
        );
        setVisitLoading(false);
        return;
      }

      if (approvalStatus === "pending") {
        toast(
          "Your church registration is pending admin approval. Please check back later.",
          { duration: 6000, icon: "🕐" },
        );
        setVisitLoading(false);
        return;
      }

      // approvalStatus === "approved" — let them in
      toast.success(
        data.is_new
          ? "Your church is registered and approved. Welcome!"
          : `Welcome back, ${visitName.trim()}!`,
      );

      const result = await loginChurchAdmin(visitName.trim(), visitPass);
      if (result.success) {
        navigate("/register/dashboard");
      } else {
        toast.error(result.error || "Login failed.");
      }
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setVisitLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-[#0A1614]">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#0d59f2]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#C5C5C5]/10 rounded-full blur-3xl" />
      </div>

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
            Church Registration Portal
          </h1>
          <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
            Select your church type to continue to the registration portal.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-white/30">
          <button
            type="button"
            onClick={() => setTab("member")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
              tab === "member"
                ? "text-[#0A1614] border-b-2 border-[#0A1614] bg-white/50"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Member Church
          </button>
          <button
            type="button"
            onClick={() => setTab("visiting")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
              tab === "visiting"
                ? "text-[#0A1614] border-b-2 border-[#0A1614] bg-white/50"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Visiting Church
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === "member" ? (
            <motion.form
              key="member"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="p-5 md:p-7 space-y-4"
            >
              {/* Info banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
                <svg
                  className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <p className="text-[11px] text-amber-500 leading-relaxed">
                  New here? Please reach out to your church admin to get
                  registered.
                </p>
              </div>

              {/* Church select */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-0.5">
                  Select Your Church
                </label>
                <ChurchDropdown
                  value={selectedChurch}
                  onChange={setSelectedChurch}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-0.5">
                  Church Access Password
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
                      Access Registration Form
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

              <div className="flex flex-col items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                  <span>
                    If you're an admin, reach out to a CAPBYFU Officer for
                    password
                  </span>
                </div>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="visiting"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleVisitingSubmit}
              className="p-5 md:p-7 space-y-4"
            >
              {/* Info banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
                <svg
                  className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <p className="text-[11px] text-amber-500 leading-relaxed">
                  First time? Enter your church name and set a password — an
                  admin will approve your access. Returning? Use the same name
                  and password you set before.
                </p>
              </div>

              {/* Church name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-0.5">
                  Your Church Name
                </label>
                <input
                  type="text"
                  value={visitName}
                  onChange={(e) => setVisitName(e.target.value)}
                  placeholder="e.g. Romblon Baptist Church"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#0A1614] focus:border-[#0A1614] transition-all outline-none"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-0.5">
                  Set / Enter Password
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
                    type={showVisitPass ? "text" : "password"}
                    value={visitPass}
                    onChange={(e) => setVisitPass(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#0A1614] focus:border-[#0A1614] transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowVisitPass(!showVisitPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0A1614] transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      {showVisitPass ? (
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

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-0.5">
                  Confirm Password
                </label>
                <input
                  type={showVisitPass ? "text" : "password"}
                  value={visitPassConfirm}
                  onChange={(e) => setVisitPassConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-[#0A1614] focus:border-[#0A1614] transition-all outline-none ${
                    visitPassConfirm && visitPass !== visitPassConfirm
                      ? "border-red-300 focus:ring-red-200"
                      : "border-slate-200"
                  }`}
                  required
                />
                {visitPassConfirm && visitPass !== visitPassConfirm && (
                  <p className="text-[11px] text-red-500 ml-0.5">
                    Passwords do not match
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    visitLoading ||
                    (visitPassConfirm && visitPass !== visitPassConfirm)
                  }
                  className="w-full bg-[#0A1614] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {visitLoading ? (
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
                      Register &amp; Access Portal
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

              {/* Forgot Password */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[11px] text-slate-400 hover:text-[#0A1614] transition-colors underline underline-offset-2"
                >
                  Forgot your password? Reset it here
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer branding */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <img
          src="/assets/logo.png"
          alt="CapBYFU Logo"
          className="h-12 object-contain opacity-100"
        />
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChurchLogin;
