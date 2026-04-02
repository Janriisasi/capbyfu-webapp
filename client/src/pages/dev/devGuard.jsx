import React from "react";
import { Navigate } from "react-router-dom";

// Validates that a properly-formed UUID token is stored (set by devLogin on success).
// Simply running sessionStorage.setItem("dev_auth", "1") won't bypass this guard.
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DevGuard = ({ children }) => {
  const token = sessionStorage.getItem("dev_auth");
  const authed = token && UUID_REGEX.test(token);
  return authed ? children : <Navigate to="/dev" replace />;
};

export default DevGuard;
