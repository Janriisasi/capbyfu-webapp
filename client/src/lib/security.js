// Security utilities - XSS prevention, input sanitization
import DOMPurify from 'dompurify';

export function sanitizeInput(value) {
  if (typeof value !== 'string') return value;
  return DOMPurify.sanitize(value.trim(), { ALLOWED_TAGS: [] });
}

export function sanitizeObject(obj) {
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    clean[key] = typeof value === 'string' ? sanitizeInput(value) : value;
  }
  return clean;
}

// Admin session management (stored in sessionStorage, not localStorage)
const ADMIN_SESSION_KEY = 'capbyfu_admin_session';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? '';

export function verifyAdminPassword(password) {
  return password === ADMIN_PASSWORD;
}

export function setAdminSession() {
  const token = crypto.randomUUID();
  const expires = Date.now() + 4 * 60 * 60 * 1000; // 4 hours
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ token, expires }));
  return token;
}

export function checkAdminSession() {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const { expires } = JSON.parse(raw);
    if (Date.now() > expires) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

// Church session
const CHURCH_SESSION_KEY = 'capbyfu_church_session';

export function setChurchSession(church) {
  sessionStorage.setItem(CHURCH_SESSION_KEY, JSON.stringify(church));
}

export function getChurchSession() {
  try {
    const raw = sessionStorage.getItem(CHURCH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearChurchSession() {
  sessionStorage.removeItem(CHURCH_SESSION_KEY);
}