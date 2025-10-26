import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Vite config with dev proxy: forwards frontend /api calls to Spring Boot backend
// This avoids CORS and 404s from the dev server when hitting API routes directly
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      // Proxy all backend API calls during development
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // If you serve static uploads from backend, proxy them too
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})