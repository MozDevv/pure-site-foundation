import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 5000,
    // In dev, proxy /api requests to the hosted backend so the browser
    // never makes a cross-origin request (avoids CORS entirely).
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  plugins: [react(), mode === 'development' && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // MUI components (largest dependency)
          'vendor-mui': ['@mui/material', '@mui/system', '@mui/utils'],
          'vendor-mui-icons': ['@mui/icons-material'],
          // Data fetching & state
          'vendor-query': ['@tanstack/react-query', 'axios'],
          // Animation & real-time
          'vendor-motion': ['framer-motion'],
          // Shadcn UI primitives (Radix)
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
          ],
          // Charts & visualization
          'vendor-charts': ['recharts'],
          // Utilities
          'vendor-utils': ['date-fns', 'clsx', 'class-variance-authority', 'tailwind-merge', 'lucide-react'],
          // CKEditor rich text editor (large, ~1MB — isolate to avoid polluting other chunks)
          'vendor-ckeditor': ['@ckeditor/ckeditor5-react', '@ckeditor/ckeditor5-build-classic'],
          // Firebase SDK
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          // Monaco Editor (loaded lazily for code playground only)
          'vendor-monaco': ['@monaco-editor/react'],
        },
      },
    },
  },
}));
