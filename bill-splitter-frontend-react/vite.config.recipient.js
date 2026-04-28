import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Recipient/Payer UI - runs on a separate port
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: false,
  },
  root: '.',
  build: {
    rollupOptions: {
      input: './recipient.html',
    },
  },
})
