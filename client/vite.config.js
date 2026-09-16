import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'HRGA Web Portal - PT Cemindo Gemilang',
        short_name: 'HRGA BOT System',
        description: 'Portal Web Manajemen Karyawan HRGA PT Cemindo Gemilang Tbk',
        theme_color: '#b51d22',
        background_color: '#0a0a0b',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/wa-bot/', // Wajib untuk deploy di subpath cg-plantbatam.com/wa-bot/
  server: {
    host: true
  }
})
