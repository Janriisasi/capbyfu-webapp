// public/firebase-messaging-sw.js
// Place this file in your /public folder (root of your project)

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ─── Replace with your actual Firebase config ─────────────────────────────────
firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
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
    icon: icon || '/assets/logo.png',
    badge: '/assets/logo.png',
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