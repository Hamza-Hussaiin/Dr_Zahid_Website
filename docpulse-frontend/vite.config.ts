import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Dev-only proxy: forwards relative /api/* calls (see src/services/api.ts)
      // to your backend so you don't need CORS or a VITE_API_URL during `npm run dev`.
      // Only used when VITE_API_URL is NOT set. Change the target port to match
      // your backend, or remove this block if you set VITE_API_URL instead.
      proxy: process.env.VITE_API_URL
        ? undefined
        : {
            '/api': {
              target: 'http://localhost:5000',
              changeOrigin: true,
            },
          },
    },
  };
});
