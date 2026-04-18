// src/hooks/usePushNotifications.js

import { useState, useEffect, useCallback } from 'react';
import { messaging, getToken, onMessage } from '../lib/firebase';
import { supabase } from '../lib/supabase';

// Get this from: Firebase Console → Project Settings → Cloud Messaging → Web Push Certificates → Key pair
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const usePushNotifications = () => {
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );
  const [fcmToken, setFcmToken] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if browser supports notifications
  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    messaging !== null;

  // ── Save FCM token to Supabase ──────────────────────────────────────────────
  const saveTokenToDb = useCallback(async (token) => {
    if (!token) return;

    // Upsert: store unique tokens so we can broadcast to all subscribers
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { fcm_token: token, subscribed_at: new Date().toISOString() },
        { onConflict: 'fcm_token' }
      );

    if (error) console.error('Failed to save FCM token:', error);
    else setIsSubscribed(true);
  }, []);

  // ── Remove FCM token from Supabase ─────────────────────────────────────────
  const removeTokenFromDb = useCallback(async (token) => {
    if (!token) return;
    await supabase.from('push_subscriptions').delete().eq('fcm_token', token);
    setIsSubscribed(false);
  }, []);

  // ── Request permission & get FCM token ─────────────────────────────────────
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications not supported in this browser.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Request notification permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        setError('Permission denied. Enable notifications in browser settings.');
        setLoading(false);
        return false;
      }

      // Register the FCM service worker
      const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swReg,
      });

      if (token) {
        setFcmToken(token);
        await saveTokenToDb(token);
        setLoading(false);
        return true;
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

  // ── Unsubscribe ─────────────────────────────────────────────────────────────
  const unsubscribe = useCallback(async () => {
    if (fcmToken) await removeTokenFromDb(fcmToken);
    setFcmToken(null);
    setIsSubscribed(false);
  }, [fcmToken, removeTokenFromDb]);

  // ── Listen for foreground messages ─────────────────────────────────────────
  useEffect(() => {
    if (!messaging) return;

    const unsubForeground = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground message:', payload);

      // Show a native notification even when app is open
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

  // ── Check existing subscription on mount ───────────────────────────────────
  useEffect(() => {
    const checkExisting = async () => {
      if (!isSupported || Notification.permission !== 'granted') return;

      try {
        const swReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
        if (!swReg) return;

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (token) {
          setFcmToken(token);
          // Check if this token is actually in our DB
          const { data } = await supabase
            .from('push_subscriptions')
            .select('fcm_token')
            .eq('fcm_token', token)
            .single();

          if (data) setIsSubscribed(true);
        }
      } catch {
        // Not subscribed — that's fine
      }
    };

    checkExisting();
  }, [isSupported]);

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