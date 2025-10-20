import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    // ✅ Fixes the 500kb warning threshold
    chunkSizeWarningLimit: 2000, // increase limit to 2MB

    // ✅ Optional: better chunk splitting (improves load time)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('antd')) return 'vendor-antd'
            if (id.includes('firebase')) return 'vendor-firebase'
            if (id.includes('react')) return 'vendor-react'
            return 'vendor' // fallback for other packages
          }
        },
      },
    },
  },
})
