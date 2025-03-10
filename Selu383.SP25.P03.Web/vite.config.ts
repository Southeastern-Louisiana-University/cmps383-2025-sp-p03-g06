import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the .NET backend during development
      '/api': {
        target: 'http://localhost:5249',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})