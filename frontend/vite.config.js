import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  server: {
    port: 3000,
    open: true,
    allowedHosts: ['a7da9ba9a135.ngrok-free.app'],
  }
}) 