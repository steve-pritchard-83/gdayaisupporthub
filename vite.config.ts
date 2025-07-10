import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use root path for local development, GitHub Pages path for production
  base: process.env.NODE_ENV === 'production' ? '/gdayaisupporthub/' : '/',
  build: {
    outDir: 'dist',
  },
})
