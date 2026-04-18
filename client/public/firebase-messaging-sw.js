// public/firebase-messaging-sw.js
// Place this file in your /public folder (root of your project)

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ─── Replace with your actual Firebase config ─────────────────────────────────
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

// Handle background messages (when app is closed / not in focus)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const { title, body, icon, image, data } = payload.notification || {};
  const notifData = payload.data || {};

  self.registration.showNotification(title || 'CapBYFU', {
    body: body || '',
    icon: icon || '/favicon.svg',
    badge: '/favicon.svg',
    image: image || notifData.image_url || undefined,
    data: {
      url: notifData.url || '/announcements',
      ...notifData,
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    vibrate: [100, 50, 100],
    tag: notifData.id || 'capbyfu-announcement',
    renotify: true,
  });
});

// Clicking notification opens the correct page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/announcements';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open new tab
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});