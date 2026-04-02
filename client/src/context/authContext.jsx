import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

// ─── Brute-force throttle helper ─────────────────────────────────────────────
// Tracks failed attempts per "key" (e.g. "superAdmin" or churchName).
// After MAX_ATTEMPTS failures within the window, further attempts are blocked
// for LOCKOUT_MS milliseconds.
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000; // 60 seconds

function useLoginThrottle() {
  const attempts = useRef({}); // { [key]: { count, lockedUntil } }

  const check = useCallback((key) => {
    const now = Date.now();
    const entry = attempts.current[key];
    if (entry && entry.lockedUntil > now) {
      const secs = Math.ceil((entry.lockedUntil - now) / 1000);
      return { allowed: false, secondsLeft: secs };
    }
    return { allowed: true, secondsLeft: 0 };
  }, []);

  const recordFailure = useCallback((key) => {
    const now = Date.now();
    const entry = attempts.current[key] || { count: 0, lockedUntil: 0 };
    const count = entry.count + 1;
    const lockedUntil = count >= MAX_ATTEMPTS ? now + LOCKOUT_MS : entry.lockedUntil;
    attempts.current[key] = { count, lockedUntil };
  }, []);

  const recordSuccess = useCallback((key) => {
    delete attempts.current[key];
  }, []);

  return { check, recordFailure, recordSuccess };
}

export const AuthProvider = ({ children }) => {
  const [churchAdmin, setChurchAdmin] = useState(() => {
    try {
      const stored = sessionStorage.getItem("churchAdmin");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [superAdmin, setSuperAdmin] = useState(() => {
    try {
      const stored = sessionStorage.getItem("superAdmin");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const throttle = useLoginThrottle();

  const loginChurchAdmin = useCallback(async (churchName, password) => {
    setLoading(true);
    try {
      // ── Throttle check ───────────────────────────────────────────────────
      const { allowed, secondsLeft } = throttle.check(`church:${churchName}`);
      if (!allowed) {
        return {
          success: false,
          error: `Too many failed attempts. Please wait ${secondsLeft}s before trying again.`,
        };
      }

      // Step 1: Verify password server-side via RPC using church name (TEXT)
      const { data: valid, error: verifyError } = await supabase.rpc(
        "verify_church_password",
        { church_name: churchName, plain_password: password },
      );

      if (verifyError) throw new Error(verifyError.message);
      if (!valid) {
        throttle.recordFailure(`church:${churchName}`);
        throw new Error("Invalid password");
      }

      // Step 2: Fetch safe church data by name to get the UUID
      const { data, error } = await supabase
        .from("churches")
        .select("id, name, circuit, drive_link")
        .eq("name", churchName)
        .single();

      if (error || !data) throw new Error("Church not found");

      throttle.recordSuccess(`church:${churchName}`);
      const admin = {
        churchId: data.id,
        churchName: data.name,
        circuit: data.circuit,
      };
      setChurchAdmin(admin);
      sessionStorage.setItem("churchAdmin", JSON.stringify(admin));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [throttle]);

  const loginSuperAdmin = useCallback(async (password) => {
    setLoading(true);
    try {
      // ── Throttle check ───────────────────────────────────────────────────
      const { allowed, secondsLeft } = throttle.check("superAdmin");
      if (!allowed) {
        return {
          success: false,
          error: `Too many failed attempts. Please wait ${secondsLeft}s before trying again.`,
        };
      }

      const { data, error } = await supabase.rpc(
        "verify_super_admin_password",
        { plain_password: password },
      );

      if (error || !data) {
        throttle.recordFailure("superAdmin");
        throw new Error("Invalid admin password");
      }

      throttle.recordSuccess("superAdmin");
      setSuperAdmin({ role: "superadmin" });
      sessionStorage.setItem(
        "superAdmin",
        JSON.stringify({ role: "superadmin" }),
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [throttle]);

  const logoutChurchAdmin = useCallback(() => {
    setChurchAdmin(null);
    sessionStorage.removeItem("churchAdmin");
  }, []);

  const logoutSuperAdmin = useCallback(() => {
    setSuperAdmin(null);
    sessionStorage.removeItem("superAdmin");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        churchAdmin,
        superAdmin,
        loading,
        loginChurchAdmin,
        loginSuperAdmin,
        logoutChurchAdmin,
        logoutSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
