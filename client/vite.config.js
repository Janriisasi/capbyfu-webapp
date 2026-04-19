import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // ── Use custom SW so we can merge FCM into the PWA SW ──────────────────
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      // ───────────────────────────────────────────────────────────────────────
      registerType: 'autoUpdate',
      includeAssets: ['/favicon.svg'],
      manifest: {
        name: 'CapBYFU — Capiz Baptist Youth Fellowship Union',
        short_name: 'CapBYFU',
        description: 'Empowering the Baptist youth of Capiz through Christ-centered fellowship and transformational leadership.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      }
    })
  ],
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
});