import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: "/bath",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Opciones de registro del service worker
      registerType: 'autoUpdate',
      // Archivos adicionales que se copiarán tal cual al directorio de salida
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png'
      ],
      // Definición del manifiesto de la PWA
      manifest: {
        name: 'Occupied Bathroom',
        short_name: 'Bath',
        description: 'Aplicación para indicar baños ocupados',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
