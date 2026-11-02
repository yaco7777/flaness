import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Tienda del Equipo',
        short_name: 'Tienda',
        lang: 'es',
        start_url: '/',
        display: 'standalone',
        theme_color: '#0F1B2D',
        background_color: '#0F1B2D',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/auth/, /^\/pedidos/, /^\/usuarios\/me/, /^\/arrepentimiento/],
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) =>
              !sameOrigin &&
              (url.pathname.startsWith('/demo/') || url.pathname.startsWith('/static/')),
            handler: 'CacheFirst',
            options: {
              cacheName: 'imagenes',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url, sameOrigin, request }) =>
              !sameOrigin &&
              request.method === 'GET' &&
              url.pathname.startsWith('/productos'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'catalogo',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
});