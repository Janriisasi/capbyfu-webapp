// public/firebase-messaging-sw.js
// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: This file must live at the ROOT of your /public folder so it is
// served at https://yourdomain.com/firebase-messaging-sw.js
//
// IMPORTANT: You CANNOT use import.meta.env here — service workers don't have
// access to Vite's env. Paste your Firebase config values directly below.
// ─────────────────────────────────────────────────────────────────────────────

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ── Paste your Firebase project config here (from Firebase Console) ───────────
firebase.initializeApp({
  apiKey: "AIzaSyCiP06v8XvIeQ9J32KV7FsA3fRKaFnVK3Y",
  authDomain: "capiz-capbyfu.firebaseapp.com",
  projectId: "capiz-capbyfu",
  storageBucket: "capiz-capbyfu.firebasestorage.app",
  messagingSenderId: "235123795112",
  appId: "1:235123795112:web:6d9f54d72be209e85f8e9d",
});
// ─────────────────────────────────────────────────────────────────────────────

const messaging = firebase.messaging();

// ── Background message handler ────────────────────────────────────────────────
// This fires when your app is in the background or closed.
// For foreground messages, see the onMessage() call in usePushNotifications.js
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const { title, body, icon, image } = payload.notification || {};
  const data = payload.data || {};

  const notificationOptions = {
    body: body || '',
    icon: icon || '/favicon.svg',
    badge: '/favicon.svg',
    image: image || data.image_url || undefined,
    data: {
      url: data.url || '/announcements',
    },
    // Vibrate pattern for mobile
    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(title || 'CapBYFU', notificationOptions);
});

// ── Handle notification click ─────────────────────────────────────────────────
// When the user taps the notification, open the correct page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/announcements';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});