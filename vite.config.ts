import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Development config with proxy to Rebrickable API
// This simulates the Cloudflare Pages Function locally
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [react()],
  server: {
    proxy: {
      '/api/rebrickable': {
        target: 'https://rebrickable.com/api/v3/lego',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rebrickable/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add API key from environment variable
            const apiKey = env.REBRICKABLE_API_KEY;

            if (!apiKey) {
              console.error('\n❌ [Vite Proxy] REBRICKABLE_API_KEY not found in .env file!');
              console.error('   Please create a .env file with: REBRICKABLE_API_KEY=your_key_here\n');
            } else {
              proxyReq.setHeader('Authorization', `key ${apiKey}`);
            }

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
  }
})
