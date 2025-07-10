import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use root path for local development, GitHub Pages path for production
  base: process.env.NODE_ENV === 'production' ? '/gdayaisupporthub/' : '/',
  build: {
    outDir: 'docs',
  },
  // Ensure production builds use the correct base path
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
})
