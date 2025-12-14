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
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add API key from environment variable (for local dev only)
            const apiKey = process.env.REBRICKABLE_API_KEY || '91279517834bc15097f38b7b523d71c0';
            proxyReq.setHeader('Authorization', `key ${apiKey}`);

            // Log the outgoing request
            const targetUrl = `https://rebrickable.com/api/v3/lego${proxyReq.path}`;
            console.log('\n[Vite Proxy] Outgoing Request:', {
              timestamp: new Date().toISOString(),
              method: req.method,
              clientUrl: req.url,
              rebrickableUrl: targetUrl,
              hasApiKey: !!apiKey,
            });
          });

          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Log the incoming response
            console.log('[Vite Proxy] Response:', {
              url: req.url,
              status: proxyRes.statusCode,
              statusMessage: proxyRes.statusMessage,
              ok: proxyRes.statusCode >= 200 && proxyRes.statusCode < 300,
            });

            // Log response headers for debugging
            if (proxyRes.statusCode !== 200) {
              console.log('[Vite Proxy] Response Headers:', proxyRes.headers);
            }
          });

          proxy.on('error', (err, _req, _res) => {
            console.error('[Vite Proxy] Error:', {
              error: err.message,
              stack: err.stack,
            });
          });
        },
      },
    },
  },
})
