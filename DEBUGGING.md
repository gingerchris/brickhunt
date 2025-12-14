# Debugging Guide

## Viewing API Proxy Logs

The Cloudflare Pages Function that proxies Rebrickable API requests includes detailed logging for debugging.

### What Gets Logged

Every API request logs:
```json
{
  "timestamp": "2024-12-14T14:30:45.123Z",
  "method": "GET",
  "clientUrl": "/api/rebrickable/sets/?search=75192",
  "rebrickableUrl": "https://rebrickable.com/api/v3/lego/sets/?search=75192",
  "hasApiKey": true
}
```

Every response logs:
```json
{
  "status": 200,
  "statusText": "OK",
  "ok": true
}
```

Errors log:
```json
{
  "error": "fetch failed",
  "stack": "Error: fetch failed\n    at ..."
}
```

## Viewing Logs in Production

### Method 1: Cloudflare Dashboard (Real-time)

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **brickhunt**
3. Click on the **Logs** tab
4. Select **Real-time Logs** or **Tail Workers**
5. You'll see logs stream in as requests are made

Example output:
```
[Rebrickable Proxy] {
  timestamp: '2024-12-14T14:30:45.123Z',
  method: 'GET',
  clientUrl: '/api/rebrickable/sets/?search=75192',
  rebrickableUrl: 'https://rebrickable.com/api/v3/lego/sets/?search=75192',
  hasApiKey: true
}
[Rebrickable Proxy] Response: { status: 200, statusText: 'OK', ok: true }
```

### Method 2: Cloudflare Dashboard (Historical)

1. Go to **Workers & Pages** → **brickhunt** → **Logs**
2. Select **Logpush** (requires Workers Paid plan)
3. View historical logs with filtering and search

### Method 3: Wrangler CLI (Real-time)

```bash
# Tail logs in real-time from your terminal
npx wrangler pages deployment tail --project-name=brickhunt

# Or for a specific deployment
npx wrangler pages deployment tail --project-name=brickhunt --deployment-id=<id>
```

This will stream logs to your terminal as requests happen.

### Method 4: Using curl to Test

```bash
# Test the proxy directly
curl https://brickhunt.pages.dev/api/rebrickable/sets/?search=75192

# View logs in the Cloudflare dashboard or wrangler tail
```

## Viewing Logs in Development

When running `npm run dev`, the Vite proxy doesn't log by default. You can add logging to [vite.config.ts](vite.config.ts):

```typescript
configure: (proxy, _options) => {
  proxy.on('proxyReq', (proxyReq, req, _res) => {
    // Log outgoing request
    console.log('[Vite Proxy] Request:', {
      method: req.method,
      url: req.url,
      target: proxyReq.path,
    });

    const apiKey = process.env.REBRICKABLE_API_KEY || '91279517834bc15097f38b7b523d71c0';
    proxyReq.setHeader('Authorization', `key ${apiKey}`);
  });

  proxy.on('proxyRes', (proxyRes, req, _res) => {
    // Log incoming response
    console.log('[Vite Proxy] Response:', {
      url: req.url,
      status: proxyRes.statusCode,
      statusMessage: proxyRes.statusMessage,
    });
  });
},
```

## Common Issues and Debugging

### Issue: API returns 401 Unauthorized

**Check logs for:**
```json
{
  "hasApiKey": false  // ❌ API key not set
}
```

**Solution:**
- In Cloudflare Dashboard: Set `REBRICKABLE_API_KEY` environment variable
- Verify it's set as "Secret" type
- Redeploy the site

### Issue: API returns 404 Not Found

**Check logs for:**
```json
{
  "status": 404,
  "rebrickableUrl": "https://rebrickable.com/api/v3/lego/sets/?search=INVALID"
}
```

**Solution:**
- Verify the set number exists in Rebrickable
- Check the URL construction in logs
- Ensure search parameters are encoded correctly

### Issue: CORS errors in browser

**Check logs for:**
- Request reaches the proxy: `[Rebrickable Proxy]` logs appear
- Response status: Should be 200 with CORS headers

**Solution:**
- CORS headers are automatically added by the proxy
- Check browser console for actual error
- Verify request URL matches `/api/rebrickable/*` pattern

### Issue: Slow responses

**Check logs for:**
- Time between request and response logs
- Response status: Look for 429 (rate limited)

**Example:**
```
[2024-12-14T14:30:45.123Z] [Rebrickable Proxy] Request...
[2024-12-14T14:30:48.456Z] [Rebrickable Proxy] Response... // 3+ second delay
```

**Solution:**
- Rebrickable API may be slow or rate limiting
- Check Rebrickable API status
- Implement client-side caching

## Debugging Workflow

### 1. Reproduce the Issue
Use the app and note exactly what action triggers the problem.

### 2. Check Browser Console
```javascript
// Open DevTools → Console
// Look for errors or failed requests
```

### 3. Check Network Tab
```
DevTools → Network → Filter by "rebrickable"
- Check request URL
- Check request status (200, 404, 500, etc.)
- Check response body
```

### 4. Check Cloudflare Logs
```bash
npx wrangler pages deployment tail --project-name=brickhunt
```

### 5. Compare Logs
- Browser shows `/api/rebrickable/sets/?search=75192`
- Cloudflare shows `https://rebrickable.com/api/v3/lego/sets/?search=75192`
- Verify the transformation is correct

## Advanced Debugging

### Add Custom Headers for Debugging

You can modify the proxy to return debug info:

```typescript
// In functions/api/rebrickable/[[path]].ts
return new Response(JSON.stringify(data), {
  status: response.status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'X-Rebrickable-Url': rebrickableUrl,  // Debug header
    'X-Response-Time': `${Date.now() - startTime}ms`,  // Debug header
  },
});
```

Then check in browser:
```javascript
// DevTools → Network → Click request → Headers
// Look for X-Rebrickable-Url and X-Response-Time
```

### Test Directly with curl

```bash
# Test the proxy
curl -i https://brickhunt.pages.dev/api/rebrickable/sets/?search=75192

# Should return JSON with CORS headers
```

### Monitor Rate Limits

Rebrickable has rate limits. If you're getting 429 errors:

```bash
# Check response headers
curl -i https://brickhunt.pages.dev/api/rebrickable/sets/?search=75192 | grep -i rate

# Look for:
# X-RateLimit-Limit
# X-RateLimit-Remaining
# X-RateLimit-Reset
```

## Getting Help

If you're stuck:

1. **Check logs first** - Most issues are visible in the logs
2. **Copy the exact error** - Include both browser console and Cloudflare logs
3. **Include the request URL** - From the logs
4. **Check Rebrickable API status** - They may have outages
5. **Test with curl** - Isolate whether it's the app or the API

## Log Retention

- **Free tier**: Logs available for 24 hours
- **Workers Paid**: Logs available for 30 days with Logpush
- **Recommendation**: Use `wrangler tail` during development for real-time debugging

## Disable Logging

To disable logging in production (for performance), comment out the console.log statements:

```typescript
// console.log('[Rebrickable Proxy]', ...);  // Disabled
```

But logging is lightweight and recommended for debugging.
