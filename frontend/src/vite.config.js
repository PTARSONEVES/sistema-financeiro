import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic'  // Isso faz o React ser importado automaticamente
  })],
  server: {
    port: 5173,
    open: true
  }
})