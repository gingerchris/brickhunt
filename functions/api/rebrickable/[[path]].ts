// Cloudflare Pages Function to proxy Rebrickable API requests
// This keeps the API key secure on the server side

interface Env {
  REBRICKABLE_API_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Get the path after /api/rebrickable/
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/api/rebrickable/')[1] || '';

  // Construct the Rebrickable API URL
  const rebrickableUrl = `https://rebrickable.com/api/v3/lego/${pathSegments}${url.search}`;

  // Log the request for debugging
  console.log('[Rebrickable Proxy]', {
    timestamp: new Date().toISOString(),
    method: request.method,
    clientUrl: url.pathname + url.search,
    rebrickableUrl: rebrickableUrl,
    hasApiKey: !!env.REBRICKABLE_API_KEY,
  });

  try {
    const response = await fetch(rebrickableUrl, {
      method: request.method,
      headers: {
        'Authorization': `key ${env.REBRICKABLE_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    // Log the response status
    console.log('[Rebrickable Proxy] Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    // Return the response with CORS headers
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('[Rebrickable Proxy] Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(JSON.stringify({
      error: 'Failed to fetch from Rebrickable API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
