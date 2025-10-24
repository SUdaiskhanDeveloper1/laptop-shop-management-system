import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  console.log('✅ Loaded Environment Variables:')
  console.log({
    VITE_API_KEY: env.VITE_API_KEY,
    VITE_PROJECT_ID: env.VITE_PROJECT_ID
  })

  return {
    plugins: [react()],
    server: { port: 5173 },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
  }
})
