import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Normalize: ensure trailing slash for Vite base in production
  const resolvedBase = env.VITE_BASE_PATH
    ? (env.VITE_BASE_PATH.endsWith('/') ? env.VITE_BASE_PATH : `${env.VITE_BASE_PATH}/`)
    : '/'
  const basePath = mode === 'production' ? resolvedBase : '/'

  return {
    plugins: [react()],
    base: basePath,
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['framer-motion', 'lucide-react']
          }
        }
      }
    }
  }
})
