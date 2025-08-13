import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // dagre를 별도 청크로 Separate
          if (id.includes('dagre')) {
            return 'dagre'
          }
          // React 관련 Library Separate
          if (id.includes('node_modules/react')) {
            return 'react-vendor'
          }
        }
      }
    }
  },
  optimizeDeps: {
    // Dagre 레이아웃 엔진 사전 번들링
    include: ['dagre'],
    esbuildOptions: {
      target: 'es2020'
    }
  }
})