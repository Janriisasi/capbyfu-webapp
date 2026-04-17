import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
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
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
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
  // server: {
  //   port: 8080,
  //   allowedHosts: [
  //     'charlyn-thankworthy-unshrewdly.ngrok-free.dev'
  //   ]
  // }
});
