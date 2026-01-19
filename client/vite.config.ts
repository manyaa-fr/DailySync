import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(
  ({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return{
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.API_KEY),
      },
      plugins: [react()],
      proxy: {'/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }},
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
        dedupe: ['react', 'react-dom'],
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'framer-motion'],
        esbuildOptions: {
          jsx: 'automatic',
        },
      },
    }
  }
)