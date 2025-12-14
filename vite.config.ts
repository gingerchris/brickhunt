import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Development config with proxy to Rebrickable API
// This simulates the Cloudflare Pages Function locally
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/rebrickable': {
        target: 'https://rebrickable.com/api/v3/lego',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rebrickable/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            // Add API key from environment variable (for local dev only)
            const apiKey = process.env.REBRICKABLE_API_KEY || '91279517834bc15097f38b7b523d71c0';
            proxyReq.setHeader('Authorization', `key ${apiKey}`);
          });
        },
      },
    },
  },
})
