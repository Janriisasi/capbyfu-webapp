// src/components/pushNotificationBanner.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePushNotifications } from '../hooks/usePushNotifications';

const PushNotificationBanner = () => {
  const { isSupported, permission, isSubscribed, loading, error, subscribe } =
    usePushNotifications();

  const [visible, setVisible] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);

  // Show banner after 5s — delayed so PWA prompt appears first (PWA shows immediately)
  useEffect(() => {
    if (!isSupported) return;
    if (permission === 'denied') return;
    if (isSubscribed) return;

    const wasDismissed = localStorage.getItem('push-banner-dismissed');
    if (wasDismissed) return;

    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, [isSupported, permission, isSubscribed]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('push-banner-dismissed', '1');
  };

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setJustSubscribed(true);
      setTimeout(() => setVisible(false), 2500);
    }
  };

  if (!isSupported || permission === 'denied' || permission === 'granted' || (isSubscribed && !justSubscribed)) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          // Bottom-LEFT mirrors PWA prompt on bottom-RIGHT — no overlap
          className="fixed bottom-4 left-4 z-[9998] w-[350px] max-w-[calc(100vw-32px)]"
        >
          <div className="bg-[#121A20] border border-[rgba(255,255,255,0.1)] rounded-2xl p-5 shadow-2xl relative overflow-hidden">

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {justSubscribed ? (
              // ── Success state ──
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div className="pt-1">
                  <h3 className="text-white font-bold text-base leading-tight mb-1">You're subscribed!</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    You'll get notified when we post announcements.
                  </p>
                </div>
              </motion.div>
            ) : (
              // ── Subscribe prompt ──
              <>
                <div className="flex items-start gap-4 mb-4">
                  {/* Bell icon — matches PWA's logo circle style */}
                  <div className="w-12 h-12 rounded-full shrink-0 bg-white/5 flex items-center justify-center border border-white/10">
                    <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  </div>

                  <div className="pt-1 pr-6">
                    <h3 className="text-white font-bold text-base leading-tight mb-1">
                      Stay in the loop
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Get notified about events, blogs, and news from CapBYFU.
                    </p>
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-[11px] mb-3 font-bold">{error}</p>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="flex-1 bg-[#C5C5C5] hover:cursor-pointer text-[#010101] font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Enabling...
                      </>
                    ) : (
                      'ENABLE NOTIFICATIONS'
                    )}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="text-[#C5C5C5] hover:text-white hover:cursor-pointer text-sm font-medium px-4 py-2.5 transition-colors"
                  >
                    Later
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PushNotificationBanner;