// src/hooks/usePushNotifications.js

import { useState, useEffect, useCallback } from 'react';
import { messaging, getToken, onMessage } from '../lib/firebase';
import { supabase } from '../lib/supabase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const LS_KEY = 'push-subscribed'; // localStorage key to persist subscription state

// ─── Always use the same SW registration ─────────────────────────────────────
const getSWRegistration = async () => {
  // Wait for SW to be ready (handles page refresh timing)
  if ('serviceWorker' in navigator) {
    try {
      // Try to get existing registration first
      const existing = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (existing) return existing;

      // Register fresh if not found
      return await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    } catch (err) {
      console.error('SW registration failed:', err);
      return null;
    }
  }
  return null;
};
// ─────────────────────────────────────────────────────────────────────────────

export const usePushNotifications = () => {
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );
  const [fcmToken, setFcmToken] = useState(null);
  // ── Read persisted subscription from localStorage on init ──────────────────
  const [isSubscribed, setIsSubscribed] = useState(
    () => localStorage.getItem(LS_KEY) === 'true'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    messaging !== null;

  // ── Save token to Supabase + localStorage ──────────────────────────────────
  const saveTokenToDb = useCallback(async (token) => {
    if (!token) return;
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { fcm_token: token, subscribed_at: new Date().toISOString() },
        { onConflict: 'fcm_token' }
      );
    if (error) {
      console.error('Failed to save FCM token:', error);
      return false;
    } else {
      localStorage.setItem(LS_KEY, 'true');
      setIsSubscribed(true);
      return true;
    }
  }, []);

  // ── Remove token from Supabase + localStorage ──────────────────────────────
  const removeTokenFromDb = useCallback(async (token) => {
    if (!token) return;
    await supabase.from('push_subscriptions').delete().eq('fcm_token', token);
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem('push-banner-dismissed');
    setIsSubscribed(false);
  }, []);

  // ── Subscribe ──────────────────────────────────────────────────────────────
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

      const swReg = await getSWRegistration();
      if (!swReg) throw new Error('Service worker registration failed.');

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swReg,
      });

      if (token) {
        setFcmToken(token);
        const saved = await saveTokenToDb(token);
        setLoading(false);
        return saved;
      } else {
        setError('Failed to get push token. Try again.');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Push subscription error:', err);
      setError(err.message || 'Something went wrong.');
      setLoading(false);
      return false;
    }
  }, [isSupported, saveTokenToDb]);

  // ── Unsubscribe ────────────────────────────────────────────────────────────
  const unsubscribe = useCallback(async () => {
    if (fcmToken) await removeTokenFromDb(fcmToken);
    setFcmToken(null);
  }, [fcmToken, removeTokenFromDb]);

  // ── On mount: if localStorage says subscribed, silently re-fetch the token ─
  // This keeps the token fresh (FCM tokens can rotate) without re-prompting
  useEffect(() => {
    if (!isSupported || Notification.permission !== 'granted') return;
    
    // If we have permission but no LS key, we might have reset LS or be on a new device.
    // Sync silently.
    const shouldRefresh = localStorage.getItem(LS_KEY) === 'true' || true; // Always sync if granted to be sure
    if (!shouldRefresh) return;

    const refreshToken = async () => {
      try {
        const swReg = await getSWRegistration();
        if (!swReg) return;

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (token) {
          setFcmToken(token);
          // Upsert silently to keep token current in DB
          const { error } = await supabase
            .from('push_subscriptions')
            .upsert(
              { fcm_token: token, subscribed_at: new Date().toISOString() },
              { onConflict: 'fcm_token' }
            );
          
          if (!error) {
            localStorage.setItem(LS_KEY, 'true');
            setIsSubscribed(true);
          }
        }
      } catch {
        // Token refresh failed silently — don't show banner again
      }
    };

    refreshToken();
  }, [isSupported]);

  // ── Foreground message listener ────────────────────────────────────────────
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