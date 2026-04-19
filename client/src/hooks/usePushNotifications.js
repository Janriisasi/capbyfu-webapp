// src/hooks/usePushNotifications.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { messaging, getToken, onMessage } from '../lib/firebase';
import { supabase } from '../lib/supabase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const LS_KEY = 'push-subscribed';

// ─── Wait for SW to be fully active before requesting token ──────────────────
const getSWRegistration = async () => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    // Always use ready — guarantees SW is active, not just registered
    const readyReg = await navigator.serviceWorker.ready;
    return readyReg;
  } catch (err) {
    console.error('[FCM] SW ready failed:', err);
    return null;
  }
};
// ─────────────────────────────────────────────────────────────────────────────

export const usePushNotifications = () => {
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );
  const [fcmToken, setFcmToken] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(
    () => localStorage.getItem(LS_KEY) === 'true'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Lock to prevent simultaneous token requests ───────────────────────────
  const tokenRequestInProgress = useRef(false);

  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    messaging !== null;

  // ── Save token to Supabase + localStorage ─────────────────────────────────
  const saveTokenToDb = useCallback(async (token) => {
    if (!token) return false;
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { fcm_token: token, subscribed_at: new Date().toISOString() },
        { onConflict: 'fcm_token' }
      );
    if (error) {
      console.error('[FCM] Failed to save token:', error);
      return false;
    }
    localStorage.setItem(LS_KEY, 'true');
    setIsSubscribed(true);
    console.log('[FCM] Token saved to DB successfully');
    return true;
  }, []);

  // ── Remove token from Supabase + localStorage ─────────────────────────────
  const removeTokenFromDb = useCallback(async (token) => {
    if (!token) return;
    await supabase.from('push_subscriptions').delete().eq('fcm_token', token);
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem('push-banner-dismissed');
    setIsSubscribed(false);
  }, []);

  // ── Core token fetch — shared by subscribe() and silent refresh ───────────
  const fetchAndSaveToken = useCallback(async () => {
    // Prevent simultaneous calls racing each other
    if (tokenRequestInProgress.current) {
      console.log('[FCM] Token request already in progress, skipping');
      return false;
    }
    tokenRequestInProgress.current = true;

    try {
      const swReg = await getSWRegistration();
      if (!swReg) throw new Error('Service worker not ready');

      console.log('[FCM] SW is ready, requesting token...');

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swReg,
      });

      if (!token) {
        console.warn('[FCM] No token returned from getToken()');
        return false;
      }

      console.log('[FCM] Got token:', token.substring(0, 20) + '...');
      setFcmToken(token);
      return await saveTokenToDb(token);
    } catch (err) {
      console.error('[FCM] fetchAndSaveToken error:', err);
      return false;
    } finally {
      tokenRequestInProgress.current = false;
    }
  }, [saveTokenToDb]);

  // ── Subscribe (user-initiated via banner button) ──────────────────────────
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications not supported in this browser.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        setError('Permission denied. Enable notifications in browser settings.');
        setLoading(false);
        return false;
      }

      const saved = await fetchAndSaveToken();
      setLoading(false);
      return saved;
    } catch (err) {
      console.error('[FCM] subscribe error:', err);
      setError(err.message || 'Something went wrong.');
      setLoading(false);
      return false;
    }
  }, [isSupported, fetchAndSaveToken]);

  // ── Unsubscribe ───────────────────────────────────────────────────────────
  const unsubscribe = useCallback(async () => {
    if (fcmToken) await removeTokenFromDb(fcmToken);
    setFcmToken(null);
  }, [fcmToken, removeTokenFromDb]);

  // ── On mount: silently refresh token if permission already granted ─────────
  // 2s delay lets the SW fully activate after page load before requesting token
  useEffect(() => {
    if (!isSupported) return;
    if (Notification.permission !== 'granted') return;

    const timer = setTimeout(async () => {
      console.log('[FCM] Silently refreshing token on mount...');
      await fetchAndSaveToken();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isSupported, fetchAndSaveToken]);

  // ── Foreground message listener ───────────────────────────────────────────
  useEffect(() => {
    if (!messaging) return;

    const unsubForeground = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground message:', payload);
      if (Notification.permission === 'granted') {
        const { title, body, icon } = payload.notification || {};
        new Notification(title || 'CapBYFU', {
          body,
          icon: icon || '/assets/logo.png',
          badge: '/assets/logo.png',
          data: payload.data,
        });
      }
    });

    return () => unsubForeground();
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    fcmToken,
    loading,
    error,
    subscribe,
    unsubscribe,
  };
};