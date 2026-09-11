import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/wa-bot/', // Wajib untuk deploy di subpath cg-plantbatam.com/wa-bot/
  server: {
    host: true
  }
})
