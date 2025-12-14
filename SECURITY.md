# Security Architecture

## Overview

BrickHunt implements a secure server-side proxy architecture to protect API credentials while maintaining a great user experience.

## API Key Protection

### The Problem
Many client-side apps expose API keys in the JavaScript bundle, which can be extracted by anyone inspecting the network traffic or source code.

### Our Solution
We use **Cloudflare Pages Functions** as a server-side proxy that sits between the client and the Rebrickable API.

```
┌─────────┐      ┌──────────────────┐      ┌─────────────┐
│ Browser │ ───> │ Cloudflare Pages │ ───> │ Rebrickable │
│ (React) │      │    Function      │      │     API     │
└─────────┘      └──────────────────┘      └─────────────┘
                          │
                    API Key stored
                    as encrypted
                    environment variable
```

## How It Works

### 1. Client Makes Request
```typescript
// src/services/rebrickable.ts
const API_BASE = '/api/rebrickable';

async function fetchFromRebrickable<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  return response.json();
}
```

The client makes requests to `/api/rebrickable/*` with **no API key**.

### 2. Cloudflare Pages Function Proxies Request
```typescript
// functions/api/rebrickable/[[path]].ts
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Construct Rebrickable API URL
  const rebrickableUrl = `https://rebrickable.com/api/v3/lego/${pathSegments}${url.search}`;

  // Add API key from secure environment variable
  const response = await fetch(rebrickableUrl, {
    headers: {
      'Authorization': `key ${env.REBRICKABLE_API_KEY}`,
      'Accept': 'application/json',
    },
  });

  return new Response(JSON.stringify(data), {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
};
```

The Cloudflare Function:
- Receives the request from the client
- Adds the API key from the secure environment variable
- Forwards the request to Rebrickable
- Returns the response to the client

### 3. API Key Storage
The API key is stored as an **encrypted secret** in Cloudflare Pages:
- Set via Dashboard: Settings → Environment variables → Type: Secret
- Or via CLI: `npx wrangler pages secret put REBRICKABLE_API_KEY`
- Never exposed in logs, source code, or network traffic
- Encrypted at rest

## Security Benefits

### ✅ API Key Never Exposed
- The key never appears in the client-side JavaScript bundle
- Inspecting network traffic shows no API key
- Source code contains no sensitive credentials

### ✅ Encrypted Storage
- Cloudflare stores secrets using industry-standard encryption
- Access controlled via Cloudflare's IAM system
- Only the Pages Function can access the key at runtime

### ✅ Request Control
- You can add rate limiting in the Pages Function
- You can log or block suspicious requests
- You can add authentication if needed

### ✅ User Privacy
- User data (brick lists, progress) stays in browser localStorage
- No data sent to any backend servers
- No user tracking or analytics (unless you add it)

## What's Protected

| What | How | Where |
|------|-----|-------|
| Rebrickable API Key | Encrypted environment variable | Cloudflare Pages |
| User brick lists | Browser localStorage | User's device |
| User progress | Browser localStorage | User's device |
| Camera access | HTTPS + permissions API | User's device |

## What's NOT in This App

- ❌ No user accounts or authentication
- ❌ No server-side database
- ❌ No tracking or analytics
- ❌ No cookies (except browser defaults)
- ❌ No data collection

## Deployment Security Checklist

When deploying, ensure:

1. ✅ Set `REBRICKABLE_API_KEY` as a **Secret** (encrypted) environment variable
2. ✅ Use HTTPS (automatic with Cloudflare Pages)
3. ✅ Don't commit `.env` files to git (already in `.gitignore`)
4. ✅ Set proper CORS headers (already configured in Pages Function)
5. ✅ Review security headers in `public/_headers`

## Testing Security

### Verify API Key is Not Exposed

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Search the build output:**
   ```bash
   grep -r "91279517834bc15097f38b7b523d71c0" dist/
   ```
   Should return **no results**.

3. **Inspect network traffic:**
   - Open browser DevTools → Network tab
   - Use the app to load a LEGO set
   - Check requests to `/api/rebrickable/*`
   - Verify no `Authorization` header in the **request** (only in server-side call)

4. **Check source code:**
   - View page source in browser
   - Search for "91279517834bc15097f38b7b523d71c0"
   - Should **not** be found anywhere

## Additional Security Considerations

### Rate Limiting (Future Enhancement)
You could add rate limiting to the Pages Function:

```typescript
// Example - not implemented
const rateLimiter = new Map();

export const onRequest: PagesFunction<Env> = async (context) => {
  const ip = context.request.headers.get('CF-Connecting-IP');

  // Check rate limit
  if (isRateLimited(ip)) {
    return new Response('Too many requests', { status: 429 });
  }

  // ... proxy request
};
```

### Authentication (Future Enhancement)
If you want to require user authentication:

```typescript
// Example - not implemented
export const onRequest: PagesFunction<Env> = async (context) => {
  const authHeader = context.request.headers.get('Authorization');

  if (!isValidUser(authHeader)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // ... proxy request
};
```

### Monitoring
Cloudflare provides:
- Request analytics (Dashboard → Analytics)
- Error tracking
- Performance metrics
- Geographic distribution

## Questions?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

## License

This security architecture can be used as a template for other projects that need to protect API keys in client-side applications.
