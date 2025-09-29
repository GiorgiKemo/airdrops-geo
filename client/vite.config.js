import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    ...(mode !== 'production' && {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        }
      }
    })
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Increase the warning limit to avoid unnecessary warnings
    chunkSizeWarningLimit: 1000,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and related libraries into a separate vendor chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          // UI components and styling libraries
          'vendor-ui': ['react-icons', 'react-textarea-autosize', 'emoji-picker-react'],
          // Utility libraries
          'vendor-utils': ['axios', 'prop-types']
        }
      }
    },
    // Enable source map for better debugging in production
    sourcemap: true,
    // Use the default minifier (esbuild) which is faster
    minify: 'esbuild',
    esbuildOptions: {
      // Drop console logs and debugger statements in production
      drop: ['console', 'debugger']
    }
  }
}))
