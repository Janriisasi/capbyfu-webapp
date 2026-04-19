// src/sw.js
// ─────────────────────────────────────────────────────────────────────────────
// Combined Service Worker: handles both PWA (Workbox) caching and FCM push
// notifications in a single SW so navigator.serviceWorker.ready always
// resolves to the correct SW that FCM tokens are bound to.
//
// VitePWA injectManifest will inject the Workbox precache manifest here.
// ─────────────────────────────────────────────────────────────────────────────

// ── Firebase FCM (compat scripts work in SW context) ─────────────────────────
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCiP06v8XvIeQ9J32KV7FsA3fRKaFnVK3Y",
  authDomain: "capiz-capbyfu.firebaseapp.com",
  projectId: "capiz-capbyfu",
  storageBucket: "capiz-capbyfu.firebasestorage.app",
  messagingSenderId: "235123795112",
  appId: "1:235123795112:web:6d9f54d72be209e85f8e9d",
});

const messaging = firebase.messaging();

// ── Background push message handler ──────────────────────────────────────────
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background FCM message received:', payload);

  const { title, body, icon, image } = payload.notification || {};
  const data = payload.data || {};

  self.registration.showNotification(title || 'CapBYFU', {
    body: body || '',
    icon: icon || '/favicon.svg',
    badge: '/favicon.svg',
    image: image || data.image_url || undefined,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/announcements',
    },
  });
});

// ── Notification click handler ────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/announcements';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ── Workbox PWA caching (VitePWA injects the manifest here) ──────────────────
import { precacheAndRoute } from 'workbox-precaching';

// This is replaced by VitePWA at build time with the actual precache manifest
precacheAndRoute(self.__WB_MANIFEST);