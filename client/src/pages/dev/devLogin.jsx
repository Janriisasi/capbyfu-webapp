import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const DEV_PASSWORD = import.meta.env.VITE_DEV_PASSWORD;

const DevLogin = () => {
  const navigate = useNavigate();
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pass === DEV_PASSWORD) {
      sessionStorage.setItem("dev_auth", crypto.randomUUID());
      navigate("/dev/dashboard");
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center font-mono"
      style={{ background: "#04080f" }}
    >
      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xs"
      >
        <div
          className="rounded-2xl border p-8"
          style={{ background: "#080f1a", borderColor: "rgba(0,200,120,0.15)" }}
        >
          <div className="flex items-center gap-2 mb-8">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#00c878" }}
            />
            <span
              className="text-[10px] font-black uppercase tracking-[0.25em]"
              style={{ color: "#00c878" }}
            >
              DEV ACCESS
            </span>
          </div>

          <p
            className="text-xs mb-6"
            style={{ color: "rgba(226,240,235,0.45)" }}
          >
            This area is restricted to authorized developers only.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setError(false);
              }}
              placeholder="Enter dev password"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${error ? "#f43f5e40" : "rgba(0,200,120,0.15)"}`,
                color: "#e2f0eb",
                fontFamily: "monospace",
              }}
            />
            {error && (
              <p className="text-[10px]" style={{ color: "#f43f5e" }}>
                ✗ Invalid password
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all hover:opacity-90 active:scale-95"
              style={{ background: "#00c878", color: "#04080f" }}
            >
              Access Console
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DevLogin;
